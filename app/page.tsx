import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Brain, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              WorkwithMe
            </span>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Hands-On AI for{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Smarter Work
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Less structure, more intelligence. Interact with AI agents that understand your needs and deliver results in documents, presentations, and code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  Start Using WorkwithMe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-600 hover:bg-slate-700 w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition">
              <div className="flex items-start gap-4">
                <Brain className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Multi-Modal AI</h3>
                  <p className="text-slate-400">Chat, search, research, and generate documents all in one place.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Turbo Mode</h3>
                  <p className="text-slate-400">Get instant responses powered by ultra-fast inference engines.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500/50 transition">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Smart Artifacts</h3>
                  <p className="text-slate-400">Generate documents, slides, and code that are ready to use.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-slate-700/50 py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Powerful Capabilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Web Research",
                description: "Deep research mode for comprehensive information gathering across the web."
              },
              {
                title: "Document Generation",
                description: "Create professional documents instantly with AI-powered content."
              },
              {
                title: "Code Generation",
                description: "Generate, analyze, and optimize code with intelligent suggestions."
              },
              {
                title: "Browser Agent",
                description: "AI agent that can browse websites and extract information for you."
              },
              {
                title: "Presentation Builder",
                description: "Turn your ideas into beautiful, structured presentations."
              },
              {
                title: "Real-Time Collaboration",
                description: "Work alongside AI to refine and improve your output in real-time."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Jump into the dashboard and start leveraging AI for your next project. No setup required.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Open Dashboard Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
          <p>WorkwithMe • Powered by AI • Built for productivity</p>
        </div>
      </footer>
    </div>
  )
}
