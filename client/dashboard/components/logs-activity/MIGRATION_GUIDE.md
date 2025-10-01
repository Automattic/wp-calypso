# Migration Guide: OLD to NEW Activity Log Components

## Current State Analysis

### OLD System Usage

The OLD system (`note-block-parser.js` + `notes-formatted-block`) is currently used in:

1. **`/client/my-sites/activity/activity-log-item/activity-description.jsx`**
   - Class component with click tracking
   - Renders `activityDescription` array
   - Passes `onClick` handler for analytics

2. **`/client/components/activity-card/activity-description.tsx`**
   - Functional component (simpler)
   - Renders `activityDescription` array
   - No click tracking

3. **`/client/state/data-layer/wpcom/sites/activity/from-api.js:62`**
   - API transformer
   - Calls `parseBlock(item.content)` to process API response
   - Stores in `activityDescription` field

### Data Flow

```
API Response (item.content)
    ↓
from-api.js: parseBlock(item.content)
    ↓
Redux Store (activityDescription)
    ↓
ActivityDescription Components
    ↓
FormattedBlock rendering
```

---

## Migration Strategy

### Option 1: Replace OLD Components with NEW (Recommended)

**Pros:**

- Single source of truth
- Better TypeScript support
- Cleaner codebase
- Future-proof

**Cons:**

- Need to update multiple files
- Requires testing across features

### Option 2: Make OLD Components Wrap NEW Components

**Pros:**

- Minimal changes to consuming code
- Gradual migration path
- Easy rollback

**Cons:**

- Temporary technical debt
- Extra indirection layer

---

## Implementation Plan

### Step 1: Update the API Transformer

**File:** `/client/state/data-layer/wpcom/sites/activity/from-api.js`

**Current:**

```javascript
import { parseBlock } from 'calypso/lib/notifications/note-block-parser';

activityDescription: parseBlock(item.content),
```

**New:**

```javascript
import { parseActivityContent } from 'calypso/dashboard/components/logs-activity/formatted-block-parser';

activityDescription: parseActivityContent(item.content),
```

**Why this works:**

- `parseActivityContent()` accepts the same `{ text, ranges }` format
- Returns compatible array structure
- More flexible (handles additional input formats)

---

### Step 2: Create Compatibility Wrapper (Bridge Pattern)

**File:** `/client/components/notes-formatted-block/index.jsx`

Update this file to re-export the NEW components:

```jsx
// Compatibility wrapper - forwards to new implementation
import { renderFormattedContent } from 'calypso/dashboard/components/logs-activity/formatted-block';

/**
 * Legacy FormattedBlock component
 * Now wraps the new implementation for backward compatibility
 */
const FormattedBlock = ({ content, onClick = null, meta = {} }) => {
  if (typeof content === 'string') {
    return <>{content}</>;
  }

  const items = Array.isArray(content) ? content : [content];
  const rendered = renderFormattedContent({ items, onClick, meta });

  return <>{rendered}</>;
};

export default FormattedBlock;
```

**Benefits:**

- No changes needed in consuming components
- OLD import paths still work
- Internally uses NEW logic
- Can deprecate gradually

---

### Step 3: Update OLD Block Components (Optional)

If you want to maintain the OLD component structure but use NEW logic:

**File:** `/client/components/notes-formatted-block/blocks.jsx`

```jsx
// Re-export NEW block components with compatibility layer
export {
  Strong,
  Emphasis,
  Preformatted,
  Link,
  FilePath,
  Post,
  Comment,
  Person,
  Plugin,
  Theme,
} from 'calypso/dashboard/components/logs-activity/formatted-block';

// Backup needs special handling due to Redux hooks
import { Backup as NewBackup } from 'calypso/dashboard/components/logs-activity/formatted-block';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'react-redux';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';

export const Backup = ({ content, onClick, meta, children }) => {
  const moment = useLocalizedMoment();
  const siteId = useSelector(getSelectedSiteId);
  const timezone = useSelector((state) => getSiteTimezoneValue(state, siteId));
  const gmtOffset = useSelector((state) => getSiteGmtOffset(state, siteId));

  // If rewindId exists, calculate proper timezone URL
  if (content.rewindId && content.siteSlug) {
    const rewindDateLocal = applySiteOffset(moment(content.rewindId * 1000), {
      timezone,
      gmtOffset,
    });

    const enhancedContent = {
      ...content,
      url: `/backup/${content.siteSlug}?date=${rewindDateLocal.format(INDEX_FORMAT)}`,
    };

    return <NewBackup content={enhancedContent} onClick={onClick} meta={meta}>{children}</NewBackup>;
  }

  // Otherwise use NEW component as-is
  return <NewBackup content={content} onClick={onClick} meta={meta}>{children}</NewBackup>;
};
```

---

### Step 4: Deprecate OLD Parser

**File:** `/client/lib/notifications/note-block-parser.js`

Add deprecation notice:

```javascript
/**
 * @deprecated Use parseActivityContent from 'calypso/dashboard/components/logs-activity/formatted-block-parser' instead
 * This function is maintained for backward compatibility but forwards to the new implementation
 */
export const parseBlock = (block) => {
  console.warn(
    'parseBlock is deprecated. Use parseActivityContent from formatted-block-parser instead.'
  );

  // Forward to new implementation
  const { parseActivityContent } = require('calypso/dashboard/components/logs-activity/formatted-block-parser');
  return parseActivityContent(block);
};
```

---

## Migration Checklist

### Phase 1: Preparation

- [ ] Run existing tests to establish baseline
- [ ] Document current behavior
- [ ] Create backup branch

### Phase 2: Core Changes

- [ ] Update `from-api.js` to use `parseActivityContent`
- [ ] Create compatibility wrapper in `notes-formatted-block/index.jsx`
- [ ] Update `Backup` component to support timezone (if needed)
- [ ] Add deprecation warnings to OLD parser

### Phase 3: Testing

- [ ] Test activity log rendering in `/activity-log`
- [ ] Test activity cards in backup/restore flows
- [ ] Verify click tracking still works
- [ ] Test with different activity types (posts, comments, plugins, themes, backups)
- [ ] Verify Jetpack Cloud / A8C Agencies conditional rendering

### Phase 4: Component Updates (Gradual)

- [ ] Update `activity-description.jsx` to import NEW components directly
- [ ] Update `activity-description.tsx` to import NEW components directly
- [ ] Update any other consumers found

### Phase 5: Cleanup

- [ ] Remove OLD parser once all references updated
- [ ] Remove OLD block components once all references updated
- [ ] Remove compatibility wrappers
- [ ] Update documentation

---

## Testing Scenarios

### 1. Basic Text Rendering

```javascript
const content = { text: "User logged in" };
// Should render: "User logged in"
```

### 2. Simple Formatting

```javascript
const content = {
  text: "User John logged in",
  ranges: [{ type: 'b', indices: [5, 9] }]
};
// Should render: "User <strong>John</strong> logged in"
```

### 3. Person Link

```javascript
const content = {
  text: "User john updated post",
  ranges: [{
    type: 'person',
    indices: [5, 9],
    name: 'john',
    site_id: 123
  }]
};
// Should render: "User <a href="/people/edit/123/john"><strong>john</strong></a> updated post"
```

### 4. Nested Ranges

```javascript
const content = {
  text: "John updated their post",
  ranges: [
    { type: 'b', indices: [0, 23] },
    { type: 'person', indices: [0, 4], name: 'john', site_id: 123 },
    { type: 'post', indices: [19, 23], id: 456, site_id: 123 }
  ]
};
// Should render: "<strong><a>John</a> updated their <a>post</a></strong>"
```

### 5. Backup with Timezone

```javascript
const content = {
  text: "Backup completed",
  ranges: [{
    type: 'backup',
    indices: [0, 6],
    site_slug: 'mysite',
    rewind_id: 1234567890
  }]
};
// Should render backup link with proper timezone-adjusted date
```

---

## Rollback Plan

If issues arise:

1. **Quick Rollback:**
   - Revert `from-api.js` changes
   - Revert compatibility wrapper
   - Deploy previous version

2. **Partial Rollback:**
   - Keep NEW parser in `from-api.js`
   - Use OLD rendering components
   - Investigate rendering issues

3. **Feature Flag:**
   - Add config flag to switch between OLD/NEW
   - Roll out gradually per site/user

---

## Benefits After Migration

1. **Single Implementation:** One parser, one renderer
2. **Type Safety:** Full TypeScript support
3. **Better Testing:** Modern test setup with TypeScript
4. **Comment Support:** NEW feature available everywhere
5. **Maintainability:** Cleaner code, easier to understand
6. **Consistency:** Same rendering logic across all activity logs

---

## Potential Issues & Solutions

### Issue 1: Backup Links Don't Show Correct Timezone

**Solution:** Enhance NEW `Backup` component with timezone support (see Step 3)

**Alternative:** Keep OLD `Backup` component, update others

### Issue 2: FilePath Rendering Changes Layout

**Old:** `<div><code>` (block element)
**New:** `<span><code>` (inline element)

**Solution:** Update NEW component to use `<div>` if needed, or update CSS

### Issue 3: Click Tracking Breaks

**Solution:** Ensure `onClick` and `meta` props are passed through correctly in compatibility wrapper

### Issue 4: Tests Fail

**Solution:** Update test expectations to match NEW output format (should be identical)

---

## Code Examples

### Before Migration

```jsx
// activity-description.jsx
import FormattedBlock from 'calypso/components/notes-formatted-block';

<FormattedBlock
  content={part}
  onClick={this.trackContentLinkClick}
  meta={{ activity: activityName, intent, section, published }}
/>
```

### After Migration (Option A: Direct Import)

```jsx
// activity-description.jsx
import { renderFormattedContent } from 'calypso/dashboard/components/logs-activity/formatted-block';

const formattedContent = renderFormattedContent({
  items: [part],
  onClick: this.trackContentLinkClick,
  meta: { activity: activityName, intent, section, published }
});

<>{formattedContent}</>
```

### After Migration (Option B: Compatibility Wrapper)

```jsx
// activity-description.jsx
import FormattedBlock from 'calypso/components/notes-formatted-block';
// ^ No changes needed, internally uses NEW logic

<FormattedBlock
  content={part}
  onClick={this.trackContentLinkClick}
  meta={{ activity: activityName, intent, section, published }}
/>
```

---

## Timeline Estimate

- **Phase 1 (Preparation):** 1-2 hours
- **Phase 2 (Core Changes):** 4-6 hours
- **Phase 3 (Testing):** 6-8 hours
- **Phase 4 (Gradual Updates):** 2-4 hours per component
- **Phase 5 (Cleanup):** 2-3 hours

**Total:** ~20-30 hours for complete migration

**Quick Win:** Phases 1-3 can be done in 1-2 days for immediate benefits with backward compatibility
