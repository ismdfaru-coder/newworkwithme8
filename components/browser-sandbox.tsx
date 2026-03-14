"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Play,
  Square,
  RefreshCw,
  Globe,
  Code,
  FileText,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Maximize2,
  Minimize2,
  Terminal,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface BrowserSession {
  sessionId: string
  liveViewUrl: string
  interactiveLiveViewUrl: string
}

interface ExecutionResult {
  success: boolean
  result?: {
    logs?: string[]
    error?: string
  }
  error?: string
}

interface ScrapedContent {
  success: boolean
  title?: string
  content?: string
  url?: string
  error?: string
}

type OutputTab = "console" | "content" | "code"

export function BrowserSandbox() {
  const [session, setSession] = useState<BrowserSession | null>(null)
  const [isLaunching, setIsLaunching] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [url, setUrl] = useState("https://example.com")
  const [code, setCode] = useState(`// Navigate and interact with the page
await page.goto("https://example.com");

// Get page title
const title = await page.title();
console.log("Page title:", title);

// Take a screenshot
// const screenshot = await page.screenshot();

// Click an element
// await page.click('button');

// Type into an input
// await page.fill('input[name="search"]', 'hello world');

// Get text content
const text = await page.locator('h1').textContent();
console.log("H1 text:", text);`)
  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [scrapedContent, setScrapedContent] = useState<ScrapedContent | null>(null)
  const [activeTab, setActiveTab] = useState<OutputTab>("console")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (session?.sessionId) {
        fetch("/api/firecrawl-browser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "close", sessionId: session.sessionId }),
        }).catch(console.error)
      }
    }
  }, [session?.sessionId])

  const launchSession = useCallback(async () => {
    setIsLaunching(true)
    setConsoleLogs([])
    setScrapedContent(null)

    try {
      const response = await fetch("/api/firecrawl-browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "launch" }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to launch browser session")
      }

      setSession({
        sessionId: data.sessionId,
        liveViewUrl: data.liveViewUrl,
        interactiveLiveViewUrl: data.interactiveLiveViewUrl,
      })

      setConsoleLogs(prev => [...prev, `[System] Browser session started: ${data.sessionId}`])
    } catch (error) {
      setConsoleLogs(prev => [...prev, `[Error] ${error instanceof Error ? error.message : "Failed to launch session"}`])
    } finally {
      setIsLaunching(false)
    }
  }, [])

  const closeSession = useCallback(async () => {
    if (!session?.sessionId) return

    try {
      await fetch("/api/firecrawl-browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", sessionId: session.sessionId }),
      })

      setConsoleLogs(prev => [...prev, `[System] Session closed`])
    } catch (error) {
      console.error("Error closing session:", error)
    } finally {
      setSession(null)
      setScrapedContent(null)
    }
  }, [session?.sessionId])

  const navigateToUrl = useCallback(async () => {
    if (!session?.sessionId || !url.trim()) return

    setIsExecuting(true)
    setConsoleLogs(prev => [...prev, `[Navigate] Going to ${url}...`])

    try {
      const response = await fetch("/api/firecrawl-browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "navigate",
          sessionId: session.sessionId,
          url: url.trim(),
        }),
      })

      const data: ExecutionResult = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to navigate")
      }

      if (data.result?.logs) {
        data.result.logs.forEach(log => {
          setConsoleLogs(prev => [...prev, `[Output] ${log}`])
        })
      }

      setConsoleLogs(prev => [...prev, `[Success] Navigated to ${url}`])

      // Refresh iframe
      if (iframeRef.current) {
        iframeRef.current.src = session.interactiveLiveViewUrl
      }
    } catch (error) {
      setConsoleLogs(prev => [...prev, `[Error] ${error instanceof Error ? error.message : "Navigation failed"}`])
    } finally {
      setIsExecuting(false)
    }
  }, [session?.sessionId, session?.interactiveLiveViewUrl, url])

  const executeCode = useCallback(async () => {
    if (!session?.sessionId || !code.trim()) return

    setIsExecuting(true)
    setConsoleLogs(prev => [...prev, `[Execute] Running code...`])

    try {
      const response = await fetch("/api/firecrawl-browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute",
          sessionId: session.sessionId,
          code: code.trim(),
          language: "node",
        }),
      })

      const data: ExecutionResult = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to execute code")
      }

      if (data.result?.logs && data.result.logs.length > 0) {
        data.result.logs.forEach(log => {
          setConsoleLogs(prev => [...prev, `[Output] ${log}`])
        })
      } else {
        setConsoleLogs(prev => [...prev, `[Output] Code executed successfully (no output)`])
      }

      // Refresh iframe
      if (iframeRef.current) {
        iframeRef.current.src = session.interactiveLiveViewUrl
      }
    } catch (error) {
      setConsoleLogs(prev => [...prev, `[Error] ${error instanceof Error ? error.message : "Execution failed"}`])
    } finally {
      setIsExecuting(false)
    }
  }, [session?.sessionId, session?.interactiveLiveViewUrl, code])

  const scrapeContent = useCallback(async () => {
    if (!session?.sessionId) return

    setIsExecuting(true)
    setConsoleLogs(prev => [...prev, `[Scrape] Extracting page content...`])

    try {
      const response = await fetch("/api/firecrawl-browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "scrape",
          sessionId: session.sessionId,
        }),
      })

      const data: ScrapedContent = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to scrape content")
      }

      setScrapedContent(data)
      setActiveTab("content")
      setConsoleLogs(prev => [...prev, `[Success] Page content extracted: "${data.title}"`])
    } catch (error) {
      setConsoleLogs(prev => [...prev, `[Error] ${error instanceof Error ? error.message : "Scraping failed"}`])
    } finally {
      setIsExecuting(false)
    }
  }, [session?.sessionId])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }, [])

  const refreshIframe = useCallback(() => {
    if (iframeRef.current && session?.interactiveLiveViewUrl) {
      iframeRef.current.src = session.interactiveLiveViewUrl
    }
  }, [session?.interactiveLiveViewUrl])

  return (
    <div className={cn(
      "flex flex-col bg-background border border-border rounded-lg overflow-hidden",
      isFullscreen ? "fixed inset-4 z-50" : "h-[700px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-semibold">Browser Sandbox</span>
          </div>
          {session && (
            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
              Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!session ? (
            <Button
              onClick={launchSession}
              disabled={isLaunching}
              size="sm"
              className="gap-2"
            >
              {isLaunching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Launching...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Launch Browser
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={closeSession}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Session
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          {isFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Browser View */}
        <div className="flex flex-1 flex-col border-r border-border">
          {/* URL Bar */}
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={refreshIframe}
              disabled={!session}
            >
              <RefreshCw className={cn("h-4 w-4", isExecuting && "animate-spin")} />
            </Button>
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL..."
                className="h-8 flex-1 bg-background"
                onKeyDown={(e) => e.key === "Enter" && navigateToUrl()}
                disabled={!session}
              />
              <Button
                onClick={navigateToUrl}
                disabled={!session || isExecuting}
                size="sm"
                variant="secondary"
              >
                Go
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={scrapeContent}
              disabled={!session || isExecuting}
              className="gap-1.5"
            >
              <FileText className="h-4 w-4" />
              Scrape
            </Button>
            {session?.interactiveLiveViewUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(session.interactiveLiveViewUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Browser Frame */}
          <div className="relative flex-1 bg-muted/20">
            {session?.interactiveLiveViewUrl ? (
              <iframe
                ref={iframeRef}
                src={session.interactiveLiveViewUrl}
                className="h-full w-full border-0"
                title="Browser Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                <Globe className="h-16 w-16 opacity-20" />
                <div className="text-center">
                  <p className="font-medium">No Active Session</p>
                  <p className="text-sm opacity-70">Click &quot;Launch Browser&quot; to start a new browser session</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code & Output */}
        <div className="flex w-[400px] flex-col">
          {/* Code Editor Toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2 text-sm font-medium hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code Editor
            </div>
            {showCode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Code Editor */}
          {showCode && (
            <div className="flex flex-col border-b border-border">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Write your Playwright code here..."
                className="min-h-[200px] resize-none rounded-none border-0 bg-zinc-950 font-mono text-sm text-zinc-100 focus-visible:ring-0"
                disabled={!session}
              />
              <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                <span className="text-xs text-muted-foreground">Node.js / Playwright</span>
                <Button
                  onClick={executeCode}
                  disabled={!session || isExecuting}
                  size="sm"
                  className="gap-2"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Output Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("console")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "console"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Terminal className="h-4 w-4" />
              Console
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "content"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Content
            </button>
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-auto bg-zinc-950 p-3">
            {activeTab === "console" && (
              <div className="space-y-1 font-mono text-xs">
                {consoleLogs.length === 0 ? (
                  <p className="text-zinc-500">Console output will appear here...</p>
                ) : (
                  consoleLogs.map((log, i) => (
                    <div
                      key={i}
                      className={cn(
                        "whitespace-pre-wrap break-all",
                        log.startsWith("[Error]") && "text-red-400",
                        log.startsWith("[Success]") && "text-green-400",
                        log.startsWith("[System]") && "text-blue-400",
                        log.startsWith("[Navigate]") && "text-yellow-400",
                        log.startsWith("[Execute]") && "text-purple-400",
                        log.startsWith("[Scrape]") && "text-cyan-400",
                        log.startsWith("[Output]") && "text-zinc-300"
                      )}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === "content" && (
              <div className="space-y-3">
                {scrapedContent ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-zinc-200">{scrapedContent.title || "Untitled"}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => copyToClipboard(scrapedContent.content || "")}
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    {scrapedContent.url && (
                      <p className="text-xs text-zinc-500">{scrapedContent.url}</p>
                    )}
                    <div className="max-h-[300px] overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-300">
                      {scrapedContent.content || "No content extracted"}
                    </div>
                  </>
                ) : (
                  <p className="text-zinc-500 text-sm">
                    Click &quot;Scrape&quot; to extract page content
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Clear Console */}
          {activeTab === "console" && consoleLogs.length > 0 && (
            <div className="border-t border-border bg-muted/30 p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setConsoleLogs([])}
              >
                Clear Console
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
