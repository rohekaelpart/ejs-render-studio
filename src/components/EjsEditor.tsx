import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Copy, Eye, Code2, Play, Github, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as ejs from 'ejs';
import Editor from '@monaco-editor/react';

// LocalStorage keys
const STORAGE_KEYS = {
  JS_DATA: 'ejsEditor_jsData',
  EJS_TEMPLATE: 'ejsEditor_ejsTemplate',
};

// Default values
const DEFAULT_JS_DATA = `const input = {
  title: "Welcome to EJS Editor",
  subtitle: "A powerful template engine",
  users: [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 30 },
    { name: "Charlie", age: 35 }
  ],
  features: ["Dynamic content", "Loops & conditionals", "Partials support"],
  getCurrentTime: () => new Date().toLocaleString(),
  formatName: (name) => name.toUpperCase(),
  config: {
    showBadges: true,
    theme: "light"
  }
};`;

const DEFAULT_EJS_TEMPLATE = `<div class="container">
  <header>
    <h1><%= title %></h1>
    <p class="subtitle"><%= subtitle %></p>
  </header>
  
  <section class="features">
    <h2>Key Features</h2>
    <ul>
      <% features.forEach(function(feature) { %>
        <li><%= feature %></li>
      <% }); %>
    </ul>
  </section>
  
  <section class="users">
    <h2>Users</h2>
    <div class="user-grid">
      <% users.forEach(function(user) { %>
        <div class="user-card">
          <h3><%= user.name %></h3>
          <p>Age: <%= user.age %></p>
          <% if (user.age >= 30) { %>
            <span class="badge senior">Senior</span>
          <% } else { %>
            <span class="badge junior">Junior</span>
          <% } %>
        </div>
      <% }); %>
    </div>
  </section>
</div>

<style>
  .container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
  header { text-align: center; margin-bottom: 30px; }
  h1 { color: #333; margin-bottom: 10px; }
  .subtitle { color: #666; font-size: 18px; }
  .features ul { list-style-type: none; padding: 0; }
  .features li { background: #f0f0f0; margin: 5px 0; padding: 10px; border-radius: 5px; }
  .user-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
  .user-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
  .senior { background: #4CAF50; color: white; }
  .junior { background: #2196F3; color: white; }
</style>`;

// Helper functions for localStorage
const loadFromStorage = (key: string, defaultValue: string): string => {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? saved : defaultValue;
  } catch (error) {
    console.warn(`Failed to load from localStorage: ${key}`, error);
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${key}`, error);
  }
};

const EjsEditor = () => {
  const [jsData, setJsData] = useState(() => 
    loadFromStorage(STORAGE_KEYS.JS_DATA, DEFAULT_JS_DATA)
  );

  const [ejsTemplate, setEjsTemplate] = useState(() => 
    loadFromStorage(STORAGE_KEYS.EJS_TEMPLATE, DEFAULT_EJS_TEMPLATE)
  );

  const [renderedHtml, setRenderedHtml] = useState('');
  const [error, setError] = useState('');
  const [outputMode, setOutputMode] = useState<'preview' | 'code'>('preview');
  const { toast } = useToast();

  // Listen for messages from parent window (when embedded as iframe)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // For development, allow all origins. In production, validate event.origin
      // if (event.origin !== 'https://your-parent-domain.com') return;
      
      const { type, data } = event.data;
      
      if (type === 'editor:setData') {
        if (data.jsData) {
          setJsData(data.jsData);
        }
        if (data.ejsTemplate) {
          setEjsTemplate(data.ejsTemplate);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Notify parent that editor is ready
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'editor:ready' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send updates to parent window when data changes
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'editor:dataChanged',
        data: { jsData, ejsTemplate }
      }, '*');
    }
  }, [jsData, ejsTemplate]);

  // Save to localStorage whenever jsData or ejsTemplate changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.JS_DATA, jsData);
  }, [jsData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EJS_TEMPLATE, ejsTemplate);
  }, [ejsTemplate]);

  const renderTemplate = () => {
    try {
      // Execute JavaScript code and extract the input variable
      const func = new Function(`${jsData}; return input;`);
      const data = func();
      const rendered = ejs.render(ejsTemplate, data);
      setRenderedHtml(rendered);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setRenderedHtml('');
    }
  };

  useEffect(() => {
    renderTemplate();
  }, [jsData, ejsTemplate]);

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const printOutput = () => {
    if (!renderedHtml) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Preview</title>
            <style>
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${renderedHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-primary p-4 shadow-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 rounded-lg">
              <Code2 className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <h1 className="text-md font-bold text-white">EJS HTML Editor</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="italic text-sm">All changes saved locally.</p>
            <a href="https://github.com/rohekaelpart/ejs-render-studio" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600">
              <Github className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content with Resizable Panels */}
      <div className="h-[calc(100vh-88px)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel Group - JSON Data and EJS Template */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* JSON Data Input */}
              <ResizablePanel defaultSize={50} minSize={20}>
                <Card className="h-full bg-editor-bg border-editor-border shadow-panel flex flex-col m-1">
                  <div className="flex items-center justify-between p-3 border-b border-editor-border">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <div className="w-3 h-3 bg-accent rounded-full"></div>
                      Input Data (JavaScript)
                    </h3>
                    <Button 
                      variant="copy" 
                      size="xs"
                      onClick={() => copyToClipboard(jsData, 'JavaScript data')}
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      language="javascript"
                      value={jsData}
                      onChange={(value) => setJsData(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                      }}
                    />
                  </div>
                </Card>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* EJS Template Input */}
              <ResizablePanel defaultSize={50} minSize={20}>
                <Card className="h-full bg-editor-bg border-editor-border shadow-panel flex flex-col m-1">
                  <div className="flex items-center justify-between p-3 border-b border-editor-border">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      EJS Template
                    </h3>
                    <Button 
                      variant="copy" 
                      size="xs"
                      onClick={() => copyToClipboard(ejsTemplate, 'EJS template')}
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      language="html"
                      value={ejsTemplate}
                      onChange={(value) => setEjsTemplate(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                      }}
                    />
                  </div>
                </Card>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Output */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="h-full bg-editor-bg border-editor-border shadow-panel flex flex-col m-1">
              <div className="flex items-center justify-between p-3 border-b border-editor-border">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Output
                  </h3>
                  <Tabs value={outputMode} onValueChange={(value) => setOutputMode(value as 'preview' | 'code')}>
                    <TabsList className="bg-secondary/50">
                      <TabsTrigger value="preview" className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="code" className="flex items-center gap-1">
                        <Code2 className="w-3 h-3" />
                        HTML
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="copy" 
                    size="xs"
                    onClick={() => copyToClipboard(renderedHtml, 'Rendered HTML')}
                    disabled={!renderedHtml}
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                  <Button 
                    variant="editor" 
                    size="xs"
                    onClick={printOutput}
                    disabled={!renderedHtml}
                  >
                    <Printer className="w-3 h-3" />
                    Print
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 relative overflow-hidden">
                {error ? (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 m-2 rounded-lg">
                    <h4 className="font-semibold text-destructive mb-2">Error</h4>
                    <pre className="text-sm text-destructive/80 whitespace-pre-wrap">{error}</pre>
                  </div>
                ) : (
                  <Tabs value={outputMode} className="h-full flex flex-col">
                    <TabsContent value="preview" className="flex-1 m-0">
                      <div className="h-full bg-white overflow-auto">
                        <iframe
                          srcDoc={renderedHtml}
                          className="w-full h-full border-0"
                          title="EJS Output Preview"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="code" className="flex-1 m-0">
                      <Editor
                        height="100%"
                        language="html"
                        value={renderedHtml}
                        theme="vs-dark"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on',
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default EjsEditor;