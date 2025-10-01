# Guide: Understanding Activity Event Components (NEW vs OLD)

## Overview

You have two implementations for rendering activity/notification content with formatted text:

**NEW Implementation** (in `dashboard/components/logs-activity/`):
- `activity-event.tsx` - Main component
- `formatted-block.tsx` - Block renderer
- `formatted-block-parser.ts` - Parser logic

**OLD Implementation** (in `lib/notifications/` and `components/notes-formatted-block/`):
- `note-block-parser.js` - Parser logic
- `blocks.jsx` - Block renderers
- `index.jsx` - Main renderer component

---

## Architecture Comparison

### **OLD System Architecture**

1. **Parser** (`note-block-parser.js:287`): `parseBlock(block)` function
   - Takes a block with `{ text, ranges }` structure
   - Builds a tree of nested ranges
   - Returns array of text segments and nodes

2. **Renderer** (`index.jsx:4`): `FormattedBlockRenderer` higher-order function
   - Creates a renderer from a block type mapping
   - Recursively processes nodes and their children
   - Returns React elements

3. **Block Components** (`blocks.jsx`): Individual renderers for each type
   - Strong, Emphasis, Preformatted, Link, FilePath, Post, Comment, Person, Plugin, Theme, Backup

### **NEW System Architecture**

1. **Parser** (`formatted-block-parser.ts:240`): `parseActivityContent(content)` function
   - More flexible input: accepts string, array, or object with `{ text, ranges }` or `{ items }`
   - Same tree-building logic but in TypeScript
   - Returns `ActivityBlockContent[]`

2. **Renderer** (`formatted-block.tsx:335`): `renderFormattedContent()` function
   - Maps items to `FormattedBlock` components
   - Accepts `onClick` handler and `meta` object
   - Returns array of React nodes

3. **Main Component** (`activity-event.tsx:14`): `ActivityEvent` component
   - Integrates parser + renderer
   - Adds icon support via gridicons
   - Uses WordPress components (`HStack`, `Icon`)

---

## Key Differences

### **1. Type Safety**
- **NEW**: Full TypeScript with strict types (`ActivityBlockNode`, `ActivityBlockContent`, etc.)
- **OLD**: JavaScript with JSDoc comments only

### **2. Input Flexibility**
```typescript
// NEW - accepts multiple formats:
parseActivityContent(content?: ActivityContent | string | ActivityBlockContent[])

// OLD - only accepts specific format:
parseBlock(block) // expects { text, ranges }
```

### **3. Component Structure**
```tsx
// NEW - Integrated component with icon
<ActivityEvent summary={summary} content={content} gridicon={gridicon} />

// OLD - Separate parser + renderer
const parsed = parseBlock(block);
<FormattedBlock content={parsed} onClick={handler} meta={meta} />
```

### **4. Rendering Logic**
- **NEW** (`formatted-block.tsx:303`): Uses `createFormattedBlock()` factory with closure
- **OLD** (`index.jsx:4`): Uses `FormattedBlockRenderer()` HOF (higher-order function)
- Both are functionally similar but NEW has better encapsulation

### **5. Block Type Support**

| Block Type | OLD | NEW | Notes |
|------------|-----|-----|-------|
| `b` / `strong` | ✅ (`b`) | ✅ (both) | NEW supports both aliases |
| `i` / `em` | ✅ (`i`) | ✅ (both) | NEW supports both aliases |
| `pre` | ✅ | ✅ | Preformatted text |
| `a` / `link` | ✅ (both) | ✅ (both) | Links |
| `filepath` | ✅ | ✅ | File paths |
| `post` | ✅ | ✅ | Post references |
| `comment` | ❌ | ✅ | **NEW FEATURE** |
| `person` | ✅ | ✅ | User references |
| `plugin` | ✅ | ✅ | Plugin references |
| `theme` | ✅ | ✅ | Theme references |
| `backup` | ✅ | ✅ | Backup references |

### **6. Link Handling**

**OLD** (`blocks.jsx:18-42`):
```jsx
const isWordPressLink = startsWith(originalUrl, 'https://wordpress.com');
const linkUrl = isWordPressLink ? originalUrl.substr(21) : originalUrl;
```

**NEW** (`formatted-block.tsx:34-38`):
```typescript
const isWordPressDotComUrl = (url) => !!url && url.startsWith('https://wordpress.com');
const relativizeWordPressUrl = (url) => url.replace(/^https:\/\/wordpress\.com/, '');
```
- NEW has cleaner URL manipulation using `replace()` instead of `substr()`
- NEW has dedicated utility functions

### **7. Backup Component**

**OLD** (`blocks.jsx:158-181`):
- Uses Redux hooks (`useSelector`)
- Calculates local timezone offset
- Formats date using moment.js

**NEW** (`formatted-block.tsx:258-284`):
- Simpler implementation
- Uses `url` property directly if available
- Falls back to `/backup/{siteSlug}`
- **Does NOT handle timezone conversion** ⚠️

---

## Feature Parity Analysis

### ✅ **Features Retained in NEW**

1. All core block types (strong, emphasis, links, posts, etc.)
2. Conditional rendering for Jetpack Cloud / A8C Agencies
3. WordPress.com URL relativization
4. Data attributes for tracking (`data-activity`, `data-section`, `data-intent`)
5. External link handling (`target="_blank"`, `rel="noopener noreferrer"`)
6. Post trash handling
7. Tree-building algorithm for nested ranges

### ⚠️ **Features MISSING or DIFFERENT in NEW**

1. **Backup Timezone Handling** (`blocks.jsx:158-180`)
   - **OLD**: Full timezone support with moment.js and site offset
   - **NEW**: No timezone conversion, simpler URL construction
   - **Impact**: Backup links may not show correct local time

2. **FilePath Rendering**
   - **OLD** (`blocks.jsx:44-48`): Wraps in `<div><code>`
   - **NEW** (`formatted-block.tsx:89-93`): Wraps in `<span><code>`
   - **Impact**: Layout might differ (block vs inline)

3. **Comment Block Type**
   - **OLD**: Missing entirely
   - **NEW**: Added support
   - **Impact**: Better feature coverage in NEW

4. **Error Handling**
   - Both implementations have minimal error handling
   - Neither validates range indices thoroughly

5. **Redux Dependencies**
   - **OLD**: `Backup` component uses Redux selectors
   - **NEW**: No Redux dependency
   - **Impact**: NEW is more portable but loses timezone functionality

### 🆕 **New Features in NEW**

1. **Comment support** (`formatted-block-parser.ts:74-83`, `formatted-block.tsx:121-144`)
2. **Better TypeScript types** throughout
3. **Flexible input handling** (string, array, or object)
4. **Integrated component** with icon support (`activity-event.tsx`)
5. **WordPress components** integration (`HStack`, `Icon`)
6. **Range validation** in parser (`formatted-block-parser.ts:52`)

---

## How They Work: Step-by-Step

### **OLD System Flow**

```
1. Input: { text: "User John edited post", ranges: [...] }
   ↓
2. note-block-parser.js:287 parseBlock()
   - Sort ranges by position
   - Build tree structure with addRange()
   - Recursively parse with parse() function
   ↓
3. Output: [text, { type: 'person', children: ['John'] }, text, ...]
   ↓
4. index.jsx:4 FormattedBlockRenderer
   - Map over children recursively
   - Look up renderer in blockTypeMapping
   - Render React elements
   ↓
5. blocks.jsx: Render specific components (Person, Post, etc.)
```

### **NEW System Flow**

```
1. Input: { text: "User John edited post", ranges: [...] }
   ↓
2. formatted-block-parser.ts:240 parseActivityContent()
   - Handle multiple input formats
   - Sort ranges with rangeSort()
   - Build tree with addRange()
   - Recursively parse with parseRange()
   ↓
3. Output: [text, { type: 'person', children: ['John'] }, text, ...]
   ↓
4. activity-event.tsx:14 ActivityEvent component
   - Parse content
   - Render icon if present
   - Call renderFormattedContent()
   ↓
5. formatted-block.tsx:335 renderFormattedContent()
   - Map items to FormattedBlock components
   ↓
6. formatted-block.tsx:304 FormattedBlock component
   - Recursively render children
   - Look up renderer in blockTypeMapping
   - Render specific block types (Link, Person, Post, etc.)
```

---

## Example Usage Comparison

### **OLD Usage**

```jsx
import { parseBlock } from 'calypso/lib/notifications/note-block-parser';
import FormattedBlock from 'calypso/components/notes-formatted-block';

const block = {
  text: "John updated their post",
  ranges: [
    { type: 'person', indices: [0, 4], name: 'john', site_id: 123 },
    { type: 'post', indices: [18, 22], id: 456, site_id: 123 }
  ]
};

const parsed = parseBlock(block);
return <FormattedBlock content={parsed[0]} onClick={handleClick} meta={{}} />;
```

### **NEW Usage**

```tsx
import { ActivityEvent } from 'client/dashboard/components/logs-activity/activity-event';

const log = {
  summary: "Post updated",
  content: {
    text: "John updated their post",
    ranges: [
      { type: 'person', indices: [0, 4], name: 'john', site_id: 123 },
      { type: 'post', indices: [18, 22], id: 456, site_id: 123 }
    ]
  },
  gridicon: 'posts'
};

return <ActivityEvent summary={log.summary} content={log.content} gridicon={log.gridicon} />;
```

---

## Core Algorithm: Range Tree Building

Both implementations use the same fundamental algorithm to handle nested/overlapping ranges:

### **Algorithm Overview**

1. **Sort ranges** by start position (and by length if starting at same position)
2. **Build tree structure** by finding parent ranges that "enclose" child ranges
3. **Parse recursively** from outermost ranges to innermost

### **Key Functions**

#### `rangeSort` - Sorting ranges
```typescript
// Both implementations have nearly identical logic
const rangeSort = ({ indices: [aStart, aEnd] }, { indices: [bStart, bEnd] }) => {
  // Zero-length ranges at start come first
  if (aStart === 0 && aEnd === 0 && bEnd !== 0) return -1;

  // Sort by start position
  if (aStart < bStart) return -1;
  if (bStart < aStart) return 1;

  // Same start? Longer range comes first (will be parent)
  return bEnd - aEnd;
};
```

#### `encloses` - Check if one range contains another
```typescript
// Returns true if outer range fully contains inner range
const encloses = ({ indices: [innerStart, innerEnd] }) =>
  ({ indices: [outerStart, outerEnd] }) =>
    innerStart !== 0 && innerEnd !== 0 &&
    outerStart <= innerStart && outerEnd >= innerEnd;
```

#### `addRange` - Build tree structure
```typescript
// Recursively finds parent and adds range as child
const addRange = (ranges, range) => {
  const parent = find(ranges, encloses(range));

  return parent
    ? [...ranges.slice(0, -1), { ...parent, children: addRange(parent.children, range) }]
    : [...ranges, range];
};
```

### **Example: Nested Ranges**

Input:
```json
{
  "text": "John updated their post",
  "ranges": [
    { "type": "person", "indices": [0, 4] },
    { "type": "b", "indices": [0, 23] },
    { "type": "post", "indices": [19, 23] }
  ]
}
```

After sorting and tree building:
```javascript
[
  {
    type: "b",
    indices: [0, 23],
    children: [
      { type: "person", indices: [0, 4], children: [] },
      { type: "post", indices: [19, 23], children: [] }
    ]
  }
]
```

Rendered output:
```html
<strong>
  <a href="/people/edit/123/john">John</a>
   updated their
  <a href="/reader/blogs/123/posts/456">post</a>
</strong>
```

---

## Recommendations

1. **Timezone Handling**: Consider porting the OLD backup timezone logic to NEW if accurate local times are important

2. **FilePath Rendering**: Decide if inline (`<span>`) or block (`<div>`) is more appropriate for your use case

3. **Redux Dependencies**: If you need timezone support, you'll need to add Redux back or pass timezone props

4. **Testing**: Ensure comment blocks (new feature) are thoroughly tested

5. **Migration Path**: The NEW system is more modern and maintainable, but ensure backup links work correctly for your needs

---

## Summary

The **NEW implementation** is a modernized, TypeScript version with:
- ✅ Better type safety
- ✅ More flexible input handling
- ✅ Comment block support (new)
- ✅ Cleaner code structure
- ⚠️ Missing timezone handling for backups
- ⚠️ Different FilePath rendering

The **OLD implementation** is stable but:
- ❌ No TypeScript
- ❌ Missing comment support
- ✅ Full backup timezone support
- ✅ Redux integration

Both share the same core algorithm for parsing nested ranges, so the fundamental logic is preserved.
