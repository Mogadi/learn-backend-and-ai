/* Study guide catalogue. Single source for dates and new courses.

   lastUpdated: "YYYY-MM-DD"
   updates: newest first. Each entry is
     { date: "YYYY-MM-DD", subject: "email subject", courses: ["Exact title", ...] }
     courses is [] when that email added no catalogue items.

   Picks: [title, detail, url]
   Resources: [title, length, level, description, url or null, added]
     level: "b" beginner, "i" intermediate, "a" advanced, "n" none
     url is null when a newsletter subject line had no article to open.
     added is optional "YYYY-MM-DD". Omit it for items that are not new.
     A card shows "New" while added is within 14 days of the visitor's date.

   Counts on the page are computed from this file. Do not hard-code them.
*/
(function () {
  const FCC="https://www.freecodecamp.org/news/";
  const picks=[
   ["Back-End Development for Beginners","2h · Node, Express, MongoDB",FCC+"intro-to-backend-web-development-nodejs-express-mongodb/"],
   ["Master the Command Line","1h · Linux/Unix CLI",FCC+"command-line-basics-for-beginners/"],
   ["APIs with TypeScript & Express","1h · routes, validation, errors",FCC+"build-bulletproof-apis-using-typescript-in-express/"],
   ["Relational Database Design","6h · SQL, modeling, indexing",FCC+"learn-relational-database-design/"],
   ["Docker DevOps concepts","8h · containers to cloud deploy",FCC+"docker-full-course/"]
  ];
  const data=[
  {cat:"Back-end",icon:"🛠️",note:"Rough learning order from top to bottom.",groups:[
   {name:"Foundations",items:[
    ["Master the Command Line","1h course","b","Linux/Unix CLI basics for beginners.",FCC+"command-line-basics-for-beginners/"],
    ["Git and GitHub for beginners","1h course","b","Version control basics (subject line only).",null],
    ["Learn Python interactively","4h course","b","Build a series of projects as you learn.",FCC+"learn-python-interactively/"],
    ["Learn Python by coding six projects","9h course","b","Hands-on beginner Python.",FCC+"a-beginner-s-guide-to-python-hands-on-projects-to-get-you-coding/"],
    ["JavaScript fundamentals","9h course","b","(subject line only)",null],
    ["IT fundamentals","13h course","b","Hardware, networking, security, databases, DNS, cloud, Git, Linux.",FCC+"learn-hardware-cloud-devops-networking-security-databases-dns-git-and-linux/"]]},
   {name:"Core back-end",items:[
    ["Back-End Development for Beginners","2h course","b","Node, Express, MongoDB plus DB architecture, security and testing.",FCC+"intro-to-backend-web-development-nodejs-express-mongodb/"],
    ["Build your own APIs with TypeScript and Express","1h course","b","Routes, validation and error handling.",FCC+"build-bulletproof-apis-using-typescript-in-express/"],
    ["Node.js and Express handbook","handbook","b","Write your own HTTP server.",FCC+"nodejs-and-expressjs-handbook-for-beginners/"],
    ["Relational Database Design","6h course","b","SQL, ER modeling, normal forms, indexing, query optimization.",FCC+"learn-relational-database-design/"],
    ["API architecture and how computers communicate","30 min","b","(subject line only)",null],
    ["How the JavaScript Event Loop works","1h course","i","Why Node stays non-blocking.",FCC+"mastering-the-javascript-event-loop/"]]},
   {name:"Deployment & DevOps",items:[
    ["Docker DevOps concepts","8h course","i","Containers, volumes, networking, Dockerfiles, then a cloud deployment.",FCC+"docker-full-course/"],
    ["Docker with Node.js handbook","handbook","i","Containerize a Node app.",FCC+"how-to-use-to-docker-with-nodejs-handbook/"],
    ["Containerize a Node app and deploy with GitHub Actions","20 min read","i","CI/CD basics.",FCC+"containerize-a-node-js-app-with-docker-and-deploy-with-github-actions/"],
    ["Dockerize a Go app","25 min read","b","Beginner walkthrough.",FCC+"how-to-dockerize-a-go-application-full-step-by-step-walkthrough/"],
    ["Getting started with Terraform","15 min read","b","Infrastructure as code intro.",FCC+"how-to-get-started-with-terraform/"],
    ["AWS Certified Cloud Practitioner prep","13h course","b","Beginner path into cloud.",FCC+"aws-certified-cloud-practitioner-study-course-pass-the-exam-with-this-free-13-hour-course/"],
    ["Computer network engineering fundamentals","12h course","i","(subject line only)",null],
    ["Kubernetes and platform engineering","6h course","i","(subject line only)",null],
    ["AWS Solutions Architect prep","70h course","a","(subject line only)",null]]},
   {name:"Architecture & design",items:[
    ["Learn System Design skills","2h course","i","Databases, scaling, load balancing, REST and GraphQL.",FCC+"learn-software-system-design/"],
    ["Systems Design concepts","3h course","i","5-step framework with Spotify, Booking.com, WhatsApp case studies.",FCC+"learn-how-to-design-software-systems-like-a-senior-engineer-in-our-new-course/"],
    ["How large-scale platforms handle millions of daily transactions","20 min read","i","Load balancers, caching, async work, idempotency.",FCC+"how-large-scale-platforms-handle-millions-of-daily-transactions/"]]},
   {name:"Security",items:[
    ["OWASP API Security Top 10","40 min read","i","Anatomy of common API vulnerabilities.",FCC+"engineering-anatomy-of-api-vulnerabilities-owasp-api-security-top-10/"],
    ["Secure by design","45 min read","i","Threat modeling, CORS, DB security, logging.",FCC+"secure-by-design-engineer-security-into-architecture-before-writing-code/"],
    ["Zero to Root: real-world penetration testing","2h course","i","How security researchers actually break into systems.",FCC+"learn-real-world-penetration-testing-hands-on-ethical-hacking-crash-course/"],
    ["Secure your AI agents (MCP security)","2h course","i","Emerging best practices to harden MCP servers against attackers.",FCC+"secure-your-ai-agents-free-model-context-protocol-mcp-security-course/"],]},
   {name:"Advanced back-end (later)",items:[
    ["Time-series data in PostgreSQL with TimescaleDB","4h course","a","Project-based.",FCC+"timescaledb-course-postgresql-for-time-series-data/"],
    ["Hybrid search engine in PostgreSQL (BM25 + vector retrieval)","1h course","i","Production-grade search pipeline inside Postgres, open source, by Beau Carnes.",FCC+"build-a-hybrid-search-engine-in-postgresql-bm25-vector-retrieval/"],
    ["Transactional Outbox in Node.js","25 min read","a","Fix the dual-write problem.",FCC+"how-to-fix-the-dual-write-problem-in-node-js-with-the-outbox-pattern/"],
    ["Saga pattern with NestJS, gRPC, PostgreSQL","25 min read","a","Distributed transactions.",FCC+"the-saga-pattern-in-node-js-roll-back-distributed-transactions-across-microservices/"],
    ["How OpenTelemetry works","20 min read","a","Observability.",FCC+"how-opentelemetry-works/"],
    ["How a Linux system call works","20 min read","a","OS fundamentals for back-end devs.",FCC+"how-a-system-call-actually-works-in-linux/"],
    ["CDN cache made my site slower","10 min read","i","Post-mortem.",FCC+"cdn-cache-made-my-site-slower/"],
    ["Why the internet keeps breaking (AWS us-east-1)","16 min video","i","Deep dive.",FCC+"why-does-the-internet-keep-breaking-a-deep-dive-into-aws-us-east-1/"],
    ["Algorithmic trading app with Python and Django","2h course","i","Project-style Python back-end practice.",FCC+"python-algorithmic-trading-with-snaptrade-massive-alpaca/"],
    ["Kubernetes Operators handbook","handbook","a","",FCC+"how-to-build-kubernetes-operators-a-handbook-for-devs/"],
    ["DevSecOps platform, full book","book","a","",FCC+"how-to-build-a-production-ready-devsecops-platform-from-homelab-to-aws-full-book/"],
    ["Policy as Code and OPA handbook","handbook","a","",FCC+"how-to-govern-ai-generated-infrastructure-with-policy-as-code-and-opa-full-handbook/"],
    ["Prevent poisoned GitHub Actions dependencies","10 min read","i","",FCC+"how-to-prevent-poisoned-github-actions-dependencies/"],
    ["CSRF from scratch (Spring Security)","handbook","a","",FCC+"csrf-from-scratch-browser-mechanics-attacks-and-spring-security-implementation-handbook/"],
    ["Full Stack Development (Node, Git, SQL, TypeScript)","47h course","i","(subject line only)",null],
    ["PHP and JavaScript calendar app (LAMP)","3h course","i","(subject line only)",null]]}
  ]},
  {cat:"Entry-level AI",icon:"🤖",note:"From beginner tools to building models.",groups:[
   {name:"Beginner-friendly",items:[
    ["AI literacy for everybody","1h course","b","Build an image classifier.",FCC+"ai-literacy-for-everybody/"],
    ["AI tools for developers","2h course","b","Copilot, Claude Code, Gemini CLI, terminal workflows.",FCC+"ai-tools-for-developers/"],
    ["Claude Code for Beginners","4h course","b","Setup, scaffolding, debugging, multi-file navigation.",FCC+"claude-code-for-beginners/"],
    ["Claude Code in 90 minutes","90 min course","b","Setup, context, agent workflows.",FCC+"claude-code-full-course/"],
    ["AI Agents for Beginners","3h course","b","Structured JSON output, guardrails, sandboxing.",FCC+"ai-agents-for-beginners/"],
    ["OpenAI Codex crash course","1h course","b","Build a voice-controlled Flappy Bird game.",FCC+"openai-codex-crash-course/"],
    ["How AI systems work (Python ML)","2h course","b","(subject line only)",null],
    ["Math that powers AI systems","book","b","(subject line only)",null],
    ["The paper that created modern AI: the Transformer story","9 min watch","b","",FCC+"the-paper-that-created-modern-ai-the-story-behind-the-transformer/"],
    ["Learn Vector Databases","2h course","b","Embeddings, similarity search, and ChromaDB for teeing up data for your own LLM systems.",FCC+"learn-vector-databases-for-beginners-embeddings-similarity-search-chromadb/"],]},
   {name:"Intermediate",items:[
    ["Claude Certified Developer Foundations","8h course","i","Anthropic APIs, MCP, prompt caching, prompt injection.",FCC+"unlock-the-power-of-ai-agents-with-the-new-claude-certified-developer-foundations-course/"],
    ["Build your own AI agent (Slack bot)","2h course","i","Node, Express and Postgres.",FCC+"build-your-own-ai-agent/"],
    ["Self-healing CI/CD pipeline with AI","1h course","i","",FCC+"build-a-self-healing-ci-cd-pipeline-with-ai/"],
    ["OpenAI Codex Essentials","5h course","i","AI-assisted agentic development.",FCC+"openai-codex-essentials-ai-assisted-agentic-development-course/"],
    ["Build an AI agent in Telegram","1h course","i","",FCC+"build-an-ai-agent-in-telegram-with-vercel-cursor-composio/"],
    ["AI-assisted app dev with Muse Code","3h course","i","Go backend, SQLite, Docker.",FCC+"build-ai-agents-apis-and-full-stack-apps-with-meta-muse-code-muse-spark/"],
    ["Code your own MCP server with Python","1h course","i","(subject line only)",null],
    ["MCP server with TypeScript","handbook","i","(subject line only)",null],
    ["AI Agents with LangChain and LangGraph","3h course","i","(subject line only)",null]]},
   {name:"Advanced (much later)",items:[
    ["Agentic Design Patterns (Claude Certified Architect)","13h course","a","",FCC+"claude-certified-architect-foundations-prep-for-anthropic-s-new-certification-exam"],
    ["LangChain and LangGraph agents","24h course","a","",FCC+"agentic-ai-using-langgraph-build-ai-agents-automate-workflows/"],
    ["Train a 25M-parameter LLM on your CPU","1h course","a","",FCC+"build-and-train-a-25m-parameter-llm-from-scratch-on-your-cpu/"],
    ["Reinforcement learning in pure C","2h course","a","",FCC+"building-a-reinforcement-learning-framework-from-scratch-in-pure-c/"],
    ["System design for AI agents: multi-agent PR reviewer","3h course","a","",FCC+"learn-system-design-for-ai-agents-build-a-production-ready-multi-agent-pr-reviewer"],
    ["GraphRAG with Python and Neo4j","book","a","",FCC+"how-to-build-a-graphrag-system-with-python-neo4j-and-servicenow/"],
    ["Knowledge graph handbook","handbook","a","",FCC+"how-to-build-a-knowledge-graph-with-python-and-neo4j-handbook/"],
    ["Multi-GPU training: DDP","2h course","a","",FCC+"scaling-your-ai-models-with-micro-ddp/"],
    ["Pipeline parallelism from scratch","3h course","a","",FCC+"build-pipeline-parallelism-from-scratch/"],
    ["Linear Algebra for ML","10h course","a","(subject line only)",null],
    ["Generative AI","23h course","a","(subject line only)",null],
    ["Python for Data Science","17h course","i","(subject line only)",null]]}
  ]},
  {cat:"CS fundamentals",icon:"🧠",note:"Core computer science that makes everything else easier.",groups:[
   {name:"Core CS",items:[
    ["Data Structures and Algorithms, visually","1h course","b","Lots of graphics.",FCC+"learn-data-structures-and-algorithms-visually/"],
    ["Think in code","5h course","b","How the JavaScript engine thinks.",FCC+"think-like-the-javascript-engine/"],
    ["Dijkstra's algorithm explained","22 min watch","i","",FCC+"understanding-dijkstra-s-algorithm/"],
    ["Design patterns handbook (C#)","handbook","i","",FCC+"the-design-patterns-handbook-learn-popular-design-patterns-with-c-code-examples/"],
    ["How engineers make chips","3h course","i","",FCC+"how-ai-chips-are-made/"],
    ["Why computers can't count money","6 min video","b","",FCC+"why-computers-can-t-count-money/"],
    ["Harvard CS (David Malan), Python","25h course","b","(subject line only)",null],
    ["Data Structures and Algorithms","49h course","i","(subject line only)",null],
    ["Dynamic Programming","2h course","i","(subject line only)",null],
    ["Discrete Math","9h course","i","(subject line only)",null],
    ["Cryptography","1h course","i","(subject line only)",null],
    ["CS50 Cybersecurity","8h course","i","(subject line only)",null],
    ["C and C++","6h course","i","(subject line only)",null]]}
  ]},
  {cat:"Games & graphics",icon:"🎮",note:"Games, graphics, and small projects.",groups:[
   {name:"Hands-on projects",items:[
    ["Low-level graphics: software renderer in C","2h course","i","",FCC+"master-low-level-graphics-in-c-build-a-software-renderer-from-scratch/"],
    ["3D web development with Blender and Three.js","5h course","i","",FCC+"3d-web-development-with-blender-and-three-js/"],
    ["Blender and Three.js cozy room portfolio","9h course","i","",FCC+"create-a-cute-room-portfolio-with-threejs-blender-javascript/"],
    ["Disaster simulation on a real map (Mapbox + Three.js)","handbook","i","",FCC+"disaster-simulation-real-map-mapbox-three-js/"],
    ["Discord bot with Python","handbook","b","",FCC+"how-to-build-a-basic-discord-bot-with-python/"],
    ["2D Mario-style game","1h course","b","(subject line only)",null]]}
  ]},
  {cat:"Front-end & mobile",icon:"📱",note:"Web and mobile work beside the back-end path.",groups:[
   {name:"Web and apps",items:[
    ["TypeScript and React","1h course","i","",FCC+"level-up-your-react-skills-with-typescript/"],
    ["TanStack Router crash course","2h course","i","",FCC+"master-modern-react-routing-tanstack-router-crash-course/"],
    ["Kotlin and Android","10h course","b","",FCC+"learn-modern-kotlin/"],
    ["React Native: Instagram-style app","3h course","i","",FCC+"build-and-publish-a-full-stack-mobile-app-with-ai/"],
    ["React Native grocery app","4h course","i","",FCC+"master-full-stack-mobile-development-with-react-native/"],
    ["Front-end with 19 projects","12h course","b","(subject line only)",null],
    ["Figma","8h course","b","(subject line only)",null],
    ["MERN","4h course","i","(subject line only)",null]]}
  ]},
  {cat:"Career & community",icon:"🌍",note:"Documentaries and podcasts for motivation.",groups:[
   {name:"Watch & listen",items:[
    ["Inside SEAHACK: Hong Kong hackathon","40 min documentary","n","",FCC+"inside-seahack-24-hours-to-build-an-ai-startup/"],
    ["Inside Stanford's student hackathon","100 min documentary","n","",FCC+"inside-stanford-elite-student-hackathon-full-documentary"],
    ["Podcasts: Mark Mahoney, Rachel Fernandez, Landon Gray, Sumit Saha, David Malan","1h each","n","(subject line only)",null]]}
  ]}
  ];

  const lastUpdated = "2026-11-07";
  const updates = [
    { date: "2026-11-07", subject: "Site launched", courses: [] }
  ];

  window.StudyPath = { lastUpdated: lastUpdated, updates: updates, picks: picks, data: data };
})();
