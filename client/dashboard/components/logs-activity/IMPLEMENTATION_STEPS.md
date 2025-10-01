# Step-by-Step Implementation Guide

This guide provides concrete, actionable steps to migrate from OLD to NEW activity log components.

---

## Quick Start: Compatibility Layer Approach (Recommended First Step)

This approach maintains backward compatibility while using the NEW implementation internally.

### Step 1: Update the API Transformer

**File:** `/client/state/data-layer/wpcom/sites/activity/from-api.js`

**Change line 3:**
```diff
- import { parseBlock } from 'calypso/lib/notifications/note-block-parser';
+ import { parseActivityContent as parseBlock } from 'calypso/dashboard/components/logs-activity/formatted-block-parser';
```

**Why:** This makes the API transformer use the NEW parser while maintaining the same variable name.

**Risk:** Low - both parsers have compatible output

---

### Step 2: Replace FormattedBlock Component

**File:** `/client/components/notes-formatted-block/index.jsx`

**Replace entire file with:**
```jsx
/**
 * Compatibility wrapper for FormattedBlock
 * Uses new implementation internally
 */
import { renderFormattedContent } from 'calypso/dashboard/components/logs-activity/formatted-block';

export const FormattedBlockRenderer =
	( blockTypeMapping ) =>
	( { content = {}, onClick = null, meta = {} } ) => {
		console.warn(
			'FormattedBlockRenderer is deprecated. Use renderFormattedContent from formatted-block instead.'
		);

		if ( 'string' === typeof content ) {
			return content;
		}

		const items = Array.isArray( content ) ? content : [ content ];
		const rendered = renderFormattedContent( { items, onClick, meta } );

		return <>{ rendered }</>;
	};

const FormattedBlock = ( { content, onClick = null, meta = {} } ) => {
	if ( typeof content === 'string' ) {
		return <>{ content }</>;
	}

	if ( ! content ) {
		return null;
	}

	const items = Array.isArray( content ) ? content : [ content ];
	const rendered = renderFormattedContent( { items, onClick, meta } );

	return <>{ rendered }</>;
};

export default FormattedBlock;
```

**Risk:** Low - maintains exact same API surface

---

### Step 3: Update blocks.jsx (Optional - Only if Backup Timezone is Required)

**File:** `/client/components/notes-formatted-block/blocks.jsx`

If you need to keep the OLD backup timezone logic, update only the Backup component:

```jsx
// Add at the top
import {
	Strong,
	Emphasis,
	Preformatted,
	FilePath,
	Post,
	Comment,
	Person,
	Plugin,
	Theme,
	Backup as NewBackup,
} from 'calypso/dashboard/components/logs-activity/formatted-block';

// Keep existing Link component if it's different
// Or import it: export { Link } from 'calypso/dashboard/components/logs-activity/formatted-block';

// Export NEW components
export { Strong, Emphasis, Preformatted, FilePath, Post, Comment, Person, Plugin, Theme };

// Keep OLD Backup component with timezone logic
export const Backup = ( { content, onClick, meta, children } ) => {
	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	if ( content.rewindId && content.siteSlug ) {
		const rewindDateLocal = applySiteOffset( moment( content.rewindId * 1000 ), {
			timezone,
			gmtOffset,
		} );

		const enhancedContent = {
			...content,
			url: `/backup/${ content.siteSlug }?date=${ rewindDateLocal.format( INDEX_FORMAT ) }`,
		};

		return (
			<NewBackup content={ enhancedContent } onClick={ onClick } meta={ meta }>
				{ children }
			</NewBackup>
		);
	}

	return (
		<NewBackup content={ content } onClick={ onClick } meta={ meta }>
			{ children }
		</NewBackup>
	);
};

// OR simply re-export if timezone not needed:
// export { Backup } from 'calypso/dashboard/components/logs-activity/formatted-block';
```

**Risk:** Medium - depends on whether backup timezone is critical

---

### Step 4: Test Everything

Run these commands:

```bash
# Run unit tests
npm test -- client/components/notes-formatted-block
npm test -- client/state/data-layer/wpcom/sites/activity
npm test -- client/dashboard/components/logs-activity

# Run e2e tests for activity log
npm run test:e2e -- activity-log

# Build and check for TypeScript errors
npm run build
```

**Manual Testing:**
1. Navigate to Activity Log page
2. Verify all activity types render correctly
3. Test click tracking on links
4. Verify backup links work with correct dates
5. Test in Jetpack Cloud environment

---

## Alternative: Direct Migration (Clean Approach)

If you want to completely remove the OLD components:

### Step 1: Update API Transformer

Same as above.

### Step 2: Update activity-description.jsx

**File:** `/client/my-sites/activity/activity-log-item/activity-description.jsx`

**Replace with:**
```jsx
import { Component } from 'react';
import { localize } from 'i18n-calypso';
import { renderFormattedContent } from 'calypso/dashboard/components/logs-activity/formatted-block';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

class ActivityDescription extends Component {
	trackContentLinkClick = ( {
		target: {
			dataset: { activity, section, intent },
		},
	} ) => {
		const params = { activity, section, intent };
		recordTracksEvent( 'calypso_activitylog_item_click', params );
	};

	render() {
		const {
			activity: { activityName, activityDescription, activityMeta },
			translate,
			rewindIsActive,
		} = this.props;

		if (
			'rewind__backup_error' === activityName &&
			'bad_credentials' === activityMeta.errorCode &&
			rewindIsActive
		) {
			return translate(
				'Jetpack had some trouble connecting to your site, but that problem has been resolved.'
			);
		}

		const rendered = renderFormattedContent( {
			items: activityDescription,
			onClick: this.trackContentLinkClick,
			meta: { activity: activityName },
		} );

		return <>{ rendered }</>;
	}
}

export default localize( ActivityDescription );
```

### Step 3: Update activity-description.tsx

**File:** `/client/components/activity-card/activity-description.tsx`

**Replace with:**
```tsx
import { FunctionComponent } from 'react';
import { renderFormattedContent } from 'calypso/dashboard/components/logs-activity/formatted-block';
import { Activity } from 'calypso/state/activity-log/types';

interface Props {
	activity: Activity;
}

const ActivityDescription: FunctionComponent< Props > = ( {
	activity: { activityName, activityDescription },
} ) => {
	const rendered = renderFormattedContent( {
		items: activityDescription,
		meta: { activity: activityName },
	} );

	return <>{ rendered }</>;
};

export default ActivityDescription;
```

### Step 4: Remove OLD Files

**After thorough testing**, remove these files:
- `/client/lib/notifications/note-block-parser.js`
- `/client/components/notes-formatted-block/blocks.jsx`
- `/client/components/notes-formatted-block/index.jsx`

---

## Rollback Instructions

If something goes wrong:

### Quick Rollback (Git)

```bash
# Revert all changes
git checkout -- client/state/data-layer/wpcom/sites/activity/from-api.js
git checkout -- client/components/notes-formatted-block/index.jsx
git checkout -- client/my-sites/activity/activity-log-item/activity-description.jsx
git checkout -- client/components/activity-card/activity-description.tsx
```

### Partial Rollback (Keep Parser, Revert Renderer)

```bash
# Keep NEW parser in from-api.js
# Revert only the renderer changes
git checkout -- client/components/notes-formatted-block/index.jsx
```

---

## Validation Checklist

After implementing changes, verify:

- [ ] Activity log page loads without errors
- [ ] All activity types render (posts, comments, plugins, themes, backups, users)
- [ ] Text formatting works (bold, italic, preformatted)
- [ ] Links are clickable and go to correct destinations
- [ ] Click tracking fires (check browser console for events)
- [ ] Backup links show correct timezone-adjusted dates
- [ ] External links open in new tab
- [ ] WordPress.com links are relativized (no full URL)
- [ ] Jetpack Cloud renders correctly (no WP.com links)
- [ ] A8C Agencies renders correctly (no WP.com links)
- [ ] File paths render correctly
- [ ] Nested formatting works (e.g., bold + link)
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] All tests pass

---

## Timeline

### Compatibility Layer Approach
- **Implementation:** 2-4 hours
- **Testing:** 4-6 hours
- **Total:** 1 day

### Direct Migration Approach
- **Implementation:** 6-8 hours
- **Testing:** 8-10 hours
- **Total:** 2-3 days

---

## Support & Questions

If you encounter issues:

1. Check browser console for errors
2. Verify data structure matches expected format
3. Compare rendered output with OLD implementation
4. Review ACTIVITY_EVENT_GUIDE.md for detailed comparison
5. Check test files for example usage

Common issues:
- **Backup timezone wrong:** Need to keep OLD Backup component (see Step 3)
- **Links not clickable:** Verify `onClick` prop is passed correctly
- **Formatting missing:** Check that `content.ranges` is properly structured
- **TypeScript errors:** Verify import paths and type definitions
