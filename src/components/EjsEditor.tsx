import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Eye, Code2, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as ejs from 'ejs';
import Editor from '@monaco-editor/react';

const EjsEditor = () => {
  const [jsonData, setJsonData] = useState(`{
  "title": "Welcome to EJS Editor",
  "subtitle": "A powerful template engine",
  "users": [
    { "name": "Alice", "age": 25 },
    { "name": "Bob", "age": 30 },
    { "name": "Charlie", "age": 35 }
  ],
  "features": ["Dynamic content", "Loops & conditionals", "Partials support"]
}`);

  const [ejsTemplate, setEjsTemplate] = useState(`<div class="container">
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
</style>`);

  const [renderedHtml, setRenderedHtml] = useState('');
  const [error, setError] = useState('');
  const [outputMode, setOutputMode] = useState<'preview' | 'code'>('preview');
  const { toast } = useToast();

  const renderTemplate = () => {
    try {
      const data = JSON.parse(jsonData);
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
  }, [jsonData, ejsTemplate]);

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

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-primary p-4 shadow-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/20 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EJS HTML Editor</h1>
              <p className="text-white/80 text-sm">Live template rendering with syntax highlighting</p>
            </div>
          </div>
          <Button 
            variant="copy" 
            size="sm"
            onClick={renderTemplate}
            className="bg-white/20 hover:bg-white/30"
          >
            <Play className="w-4 h-4" />
            Render
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)] gap-1">
        {/* Left Panel - Inputs */}
        <div className="flex-1 flex flex-col gap-1">
          {/* JSON Data Input */}
          <Card className="flex-1 bg-editor-bg border-editor-border shadow-panel flex flex-col m-1">
            <div className="flex items-center justify-between p-3 border-b border-editor-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                Input Data (JSON)
              </h3>
              <Button 
                variant="copy" 
                size="xs"
                onClick={() => copyToClipboard(jsonData, 'JSON data')}
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            </div>
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language="json"
                value={jsonData}
                onChange={(value) => setJsonData(value || '')}
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

          {/* EJS Template Input */}
          <Card className="flex-1 bg-editor-bg border-editor-border shadow-panel flex flex-col m-1">
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
        </div>

        {/* Right Panel - Output */}
        <Card className="flex-1 bg-editor-bg border-editor-border shadow-panel flex flex-col m-1">
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
            <Button 
              variant="copy" 
              size="xs"
              onClick={() => copyToClipboard(renderedHtml, 'Rendered HTML')}
              disabled={!renderedHtml}
            >
              <Copy className="w-3 h-3" />
              Copy
            </Button>
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
      </div>
    </div>
  );
};

export default EjsEditor;