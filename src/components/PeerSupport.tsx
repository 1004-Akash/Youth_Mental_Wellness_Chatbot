import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users, MessageCircle } from "lucide-react";

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

const initialPosts: Post[] = [
  {
    id: "1",
    author: "Anonymous",
    content: "I feel overwhelmed with exams. Anyone else struggling?",
    timestamp: new Date(),
  },
  {
    id: "2",
    author: "Anonymous",
    content: "Sometimes I feel like I can't talk to my family about my feelings.",
    timestamp: new Date(),
  },
];

const PeerSupport = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [input, setInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = () => {
    if (!input.trim()) return;
    setIsPosting(true);
    setTimeout(() => {
      setPosts(prev => [
        {
          id: Date.now().toString(),
          author: "Anonymous",
          content: input,
          timestamp: new Date(),
        },
        ...prev,
      ]);
      setInput("");
      setIsPosting(false);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-semibold">Peer Support Forum</h1>
      </div>
      <p className="text-muted-foreground">Share your thoughts and support others anonymously.</p>
      <Card>
        <CardHeader>
          <CardTitle>Post a message</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={3}
            placeholder="What's on your mind?"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isPosting}
          />
          <Button onClick={handlePost} disabled={isPosting || !input.trim()}>
            {isPosting ? "Posting..." : "Post"}
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.id}>
            <CardHeader className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{post.author}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {post.timestamp.toLocaleString()}
              </span>
            </CardHeader>
            <CardContent>
              <p>{post.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PeerSupport;
