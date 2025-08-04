import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HelpCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheatsheetItem {
  title: string;
  description: string;
  examples: Array<{
    syntax: string;
    description: string;
    output?: string;
  }>;
}

const cheatsheetData: CheatsheetItem[] = [
  {
    title: "Output Tags",
    description: "Display values in your template",
    examples: [
      {
        syntax: "<%= variable %>",
        description: "Output escaped HTML",
        output: "Hello World"
      },
      {
        syntax: "<%- html %>",
        description: "Output unescaped HTML",
        output: "<strong>Bold text</strong>"
      }
    ]
  },
  {
    title: "Control Flow",
    description: "Conditionals and loops",
    examples: [
      {
        syntax: "<% if (condition) { %>\n  content\n<% } %>",
        description: "If statement"
      },
      {
        syntax: "<% for (let i = 0; i < items.length; i++) { %>\n  <%= items[i] %>\n<% } %>",
        description: "For loop"
      },
      {
        syntax: "<% items.forEach(function(item) { %>\n  <%= item %>\n<% }); %>",
        description: "forEach loop"
      }
    ]
  },
  {
    title: "Includes & Partials",
    description: "Reuse template parts",
    examples: [
      {
        syntax: "<%- include('header') %>",
        description: "Include another template file"
      },
      {
        syntax: "<%- include('partial', {data: value}) %>",
        description: "Include with data"
      }
    ]
  },
  {
    title: "Comments",
    description: "Add comments to your templates",
    examples: [
      {
        syntax: "<%# This is a comment %>",
        description: "Server-side comment (not rendered)"
      }
    ]
  },
  {
    title: "JavaScript",
    description: "Execute JavaScript code",
    examples: [
      {
        syntax: "<% const result = someFunction(); %>",
        description: "Execute JavaScript"
      },
      {
        syntax: "<% if (user && user.name) { %>\n  Hello <%= user.name %>\n<% } %>",
        description: "Safe property access"
      }
    ]
  }
];

const Cheatsheet = () => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Syntax copied to clipboard",
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:text-rose-200 hover:bg-white/10">
          <HelpCircle className="w-4 h-4 mr-2" />
          Cheatsheet
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] max-h-[80vh] overflow-y-auto" align="end">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold">EJS Syntax Cheatsheet</h3>
            <p className="text-sm text-muted-foreground">Quick reference for EJS template syntax</p>
          </div>
          
          <Separator />
          
          {cheatsheetData.map((section, index) => (
            <Card key={index} className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {section.title}
                  </Badge>
                  <span className="text-sm font-medium">{section.description}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.examples.map((example, exampleIndex) => (
                  <div key={exampleIndex} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono block whitespace-pre-wrap">
                          {example.syntax}
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                          {example.description}
                        </p>
                        {example.output && (
                          <div className="mt-1">
                            <span className="text-xs text-muted-foreground">Output: </span>
                            <code className="text-xs bg-green-50 text-green-700 px-1 py-0.5 rounded">
                              {example.output}
                            </code>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(example.syntax)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    {exampleIndex < section.examples.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use <code className="bg-blue-100 px-1 rounded">&lt;%=</code> for safe output</li>
              <li>• Use <code className="bg-blue-100 px-1 rounded">&lt;%-</code> only for trusted HTML</li>
              <li>• Always validate user input before rendering</li>
              <li>• Use proper indentation for better readability</li>
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Cheatsheet; 