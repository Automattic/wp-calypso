# Block Notes Ability

The Block Notes ability enables AI-powered collaboration on individual blocks in the WordPress editor. Users can mention `@ai` in block notes to get AI assistance, and the AI can respond via the headless wp-orchestrator agent.

## Architecture

This ability follows the Big Sky plugin's standard ability pattern:

```
src/abilities/block-notes/
├── utils.ts                   # Utility functions for operations like replying to a note, creation of block in db.
├── index.ts                   # Block notes ability registration
└── README.md                  # This file

src/components/block-notes-subscriptions/
├── index.js                   # React component that monitors for @ai mentions
└── hooks/use-agent-config.ts  # Hook to async create agent config

```

## How It Works

### 1. User Mentions AI

When a user adds a note to a block containing `@ai`, the flow is:

1. User creates a block note with `@ai` mention
2. Note is saved to WordPress database as `comment_type: 'note'`
3. `BlockNotesSubscriptions` component detects the new note via WordPress data subscription
4. Component builds context message and submits to headless wp-orchestrator agent via `agentSubmit()`

### 2. AI Agent Response

The AI agent receives:

-   User's prompt (without `@ai`)
-   Note metadata (IDs, author, etc.)
-   Instructions to use the `big-sky/block-notes` ability to reply

The agent then:

1. Calls `big-sky/block-notes` ability with `operation: 'get'` to fetch thread context
2. Analyzes the request with full context
3. **Invokes `big-sky/block-notes` ability with `operation: 'reply'`**
4. Provides the reply content and noteId

### 3. Ability Execution

The block notes ability:

1. Receives the ability call from the wp-orchestrator agent
2. Executes `replyToNote()` with the AI's response
3. Creates a new note in the database as a reply

## Proper wp-orchestrator Flow

```javascript
// DO: Let the agent invoke the ability
const contextMessage = buildContextMessage( note, block, currentPost, postType );
await agentSubmit( contextMessage, { type: 'context' } );
```

## Ability Operations

The block notes ability supports two operations:

### `get` - Retrieve Notes

```javascript
{
  operation: 'get',
  noteId: 42           // Block note ID from the block's noteId attribute
}
```

### `reply` - Reply to Note

```javascript
{
  operation: 'reply',
  noteId: 42,        // Block note ID from the block's noteId attribute
  notes: 'Reply content text here'
}
```

## Code Organization

### `utils.ts` - Pure Utility Functions

Contains only reusable utility functions:

-   `getBlockNotes()` - Fetch notes for a block
-   `replyToNote()` - Reply to an existing note
-   `convertEntityNoteFormat()` - Convert API format


### `src/components/block-notes-subscriptions/` - AI Monitoring

React component that monitors for `@ai` mentions:

-   Subscribes to WordPress comment data store
-   Detects new notes with `@ai`
-   Submits context to headless wp-orchestrator via `agentSubmit()`
-   Marks notes as processed (meta: `bigsky_ai_processed_date`) to prevent duplicates
-   **Does NOT hardcode replies** - lets the agent use the ability

## Note Meta Fields

Notes are marked as processed using comment meta:

-   `bigsky_ai_processed_date` - ISO timestamp when processed
-   Prevents reprocessing on page reload
-   Persists across sessions

## Integration Points

### Entry Point (`src/ai/wp-orchestrator/headless/index.tsx`)

-   Initializes orchestrator with `renderUI: false`
-   Renders `<BlockNoteSubscriptions />` component after initialization
-   Creates React root for monitoring `@ai` mentions

### Ability Registration (`src/abilities/block-notes/index.ts`)

-   Registers `big-sky/block-notes` ability via WordPress Abilities API
-   Callback handles `get` and `reply` operations using utils functions
