/**
 * MySitesSidebarUnifiedSidebarGroup
 *
 * React translation of the public plugin's `buildGroupContainer`
 * (`WordPress/wp-admin-sidebar` v0.1.4 `src/browse-rail/grouping.js:214-271`).
 *
 * Identical-behaviour anchor — every visible behaviour mirrors the plugin
 * 1:1, only the render runtime differs:
 *
 * - Header DOM: `<button.toggle>` (label + collapsed-state signal dot)
 * + (optional) `<button.customize>` + `<span.chevron>`. Three flex
 * siblings — the chevron is intentionally OUTSIDE the toggle button
 * because nested `<button>` is invalid HTML. The chevron has
 * `aria-hidden="true"` and delegates click to the toggle so users who
 * click the chevron get the same expand/collapse behaviour.
 * - Header geometry: 34px min-height, padding `4px 4px 4px 8px`,
 * `box-sizing: border-box`. Outer group `margin-top: 16px`. Hover
 * paint is removed at the LI level (matches public plugin issue #35).
 * - Customize button: tooltip `Customize plugins` (data-tooltip + aria-
 * label + ::after pseudo-element with 250ms show-delay / 100ms hide).
 * Renders only when `customizable` is true (plugins group only today).
 * Stays disabled until Phase 2 wires the click handler.
 * - Group-level signal: an 8×8 `#d63638` dot rendered inline next to the
 * label when the group is collapsed AND `group.signal.attention` is
 * true. Suppressed when expanded — children carry their own item-level
 * signals (#38's "My Plugins [•]" pattern).
 * - Children list: rendered as children of a `<ul>` with a stable id so
 * the toggle's `aria-controls` references it; carries `inert` (or the
 * React-friendly `aria-hidden` shim) when collapsed so keyboard focus
 * and AT skip the hidden rows.
 * - Sticky-menu reflow: dispatches a `window.resize` event on toggle so
 * any sticky-menu-aware container reflows (mirrors public plugin
 * PR #44).
 *
 * State strategy:
 * - Initial expanded state: stored value from the
 * `adminSidebarExpandState` slice if the user has toggled this group
 * before; otherwise the group's `default_expanded` from the response.
 * Auto-expand-on-current-URL is Phase 1.4.x polish (kept on the to-do
 * list — not in this PR scope per the task scope's "deferred" list).
 * - Toggle dispatches the `toggleAdminSidebarGroup` action so the slice
 * records the change; `withPersistence` round-trips it across reloads.
 * - The actual REST POST flow (server-side persistence) is deferred to
 * Phase 2 task 2.3 (alongside Save in customize mode).
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/grouping.js
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/expand-collapse.js
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/styles.css
 */

import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useCallback, useId } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleAdminSidebarGroup } from 'calypso/state/admin-sidebar/expand-state/actions';
import { getAdminSidebarGroupExpanded } from 'calypso/state/admin-sidebar/expand-state/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const GROUP_ID_PLUGINS = 'plugins';

/**
 * Notify any sticky-menu-aware container that menu height changed. Mirrors
 * the public plugin's `notifyMenuHeightChanged()` — without the dispatch,
 * sticky containers would stay positioned for the old height after toggle
 * (issue #43, fixed in v0.1.4 / public-plugin PR #44).
 *
 * Calypso's sidebar isn't sticky in the wp-admin sense, but firing the
 * event is harmless when no listener is attached. If a future container
 * reads scroll/menu height to anchor itself, this is the hook it'll use.
 */
function notifyMenuHeightChanged() {
	if ( typeof window === 'undefined' ) {
		return;
	}
	window.dispatchEvent( new Event( 'resize' ) );
}

/**
 * Resolve the rendered expanded state from the prop / stored / default chain.
 * Extracted to a named helper to avoid the nested-ternary lint and to make
 * the priority chain explicit.
 * @param {boolean|undefined} expandedProp     Caller-supplied prop (highest priority).
 * @param {boolean|undefined} storedExpanded   User's stored toggle.
 * @param {boolean|undefined} defaultExpanded  Group metadata default.
 * @returns {boolean}
 */
function resolveExpanded( expandedProp, storedExpanded, defaultExpanded ) {
	if ( typeof expandedProp === 'boolean' ) {
		return expandedProp;
	}
	if ( typeof storedExpanded === 'boolean' ) {
		return storedExpanded;
	}
	return defaultExpanded ?? false;
}

export const MySitesSidebarUnifiedSidebarGroup = ( {
	group,
	children,
	customizable,
	className,
	// `siteId` and `expanded` can be passed as props so the component is
	// renderable in isolation (Storybook + tests). When omitted the
	// component reads them from Redux state.
	siteId: siteIdProp,
	expanded: expandedProp,
	onToggle,
} ) => {
	const dispatch = useDispatch();
	const reduxSiteId = useSelector( getSelectedSiteId );
	const siteId = siteIdProp ?? reduxSiteId;

	const storedExpanded = useSelector( ( state ) =>
		getAdminSidebarGroupExpanded( state, siteId, group.id )
	);

	// Resolve initial state in priority order:
	//   1. caller-supplied `expanded` prop (Storybook / explicit control).
	//   2. user's stored toggle for this group.
	//   3. group metadata's `default_expanded`.
	//   4. fall back to collapsed (matches the public plugin's default).
	const expanded = resolveExpanded( expandedProp, storedExpanded, group.default_expanded );

	const labelId = useId();
	const childrenId = `wp-admin-sidebar-group-${ group.id }-${ labelId }`;
	const isCustomizable = customizable ?? group.id === GROUP_ID_PLUGINS;
	const showAttentionDot = ! expanded && !! group.signal?.attention;

	const handleToggle = useCallback(
		( event ) => {
			if ( typeof onToggle === 'function' ) {
				onToggle( event, ! expanded );
			} else if ( siteId ) {
				dispatch( toggleAdminSidebarGroup( siteId, group.id ) );
			}
			// Fire after the React state update settles so the new height is
			// in the DOM by the time listeners read it. requestAnimationFrame
			// keeps the call cheap when no listener is registered.
			if ( typeof window !== 'undefined' ) {
				window.requestAnimationFrame( notifyMenuHeightChanged );
			}
		},
		[ dispatch, group.id, expanded, onToggle, siteId ]
	);

	// Translators: aria-label for the per-group customize button. Today the
	// only group surfacing this button is `plugins`, so "Customize plugins"
	// is accurate. If new groups gain customize buttons, parameterise this.
	const customizeLabel = translate( 'Customize plugins' );

	// Translators: SR-only label announcing how many items in this group
	// need attention when the group is collapsed.
	const attentionLabel =
		showAttentionDot && typeof group.signal?.count === 'number' && group.signal.count > 0
			? translate( '%(count)d item needs attention', '%(count)d items need attention', {
					count: group.signal.count,
					args: { count: group.signal.count },
			  } )
			: translate( 'Items need attention' );

	return (
		<li
			className={ clsx( 'wp-admin-sidebar-group', 'sidebar-group', className ) }
			data-group={ group.id }
			data-expanded={ expanded ? 'true' : 'false' }
		>
			<div className="wp-admin-sidebar-group__header sidebar-group__header">
				<button
					type="button"
					className="wp-admin-sidebar-group__toggle sidebar-group__toggle"
					aria-expanded={ expanded ? 'true' : 'false' }
					aria-controls={ childrenId }
					onClick={ handleToggle }
				>
					<span className="wp-admin-sidebar-group__label sidebar-group__label">
						{ group.label }
					</span>
					<span
						className="wp-admin-sidebar-group__signal sidebar-group__signal"
						data-attention={ showAttentionDot ? 'true' : undefined }
						aria-label={ showAttentionDot ? attentionLabel : undefined }
					/>
				</button>
				{ isCustomizable && (
					<button
						type="button"
						className="wp-admin-sidebar-group__customize sidebar-group__customize"
						aria-label={ customizeLabel }
						data-tooltip={ customizeLabel }
						// Phase 2 task 2.1 wires the click handler. Keep disabled
						// in Phase 1 so the affordance is visible (tooltip on
						// hover) but inert.
						disabled
					/>
				) }
				<span
					className="wp-admin-sidebar-group__chevron sidebar-group__chevron"
					aria-hidden="true"
					onClick={ handleToggle }
				/>
			</div>
			<ul
				id={ childrenId }
				className="wp-admin-sidebar-group__children sidebar-group__children"
				// React 18's JSX type defs don't expose `inert` yet (React 19
				// fixes this); the precedent in
				// `client/dashboard/components/sidebar/sidebar-expandable-menu-item.tsx`
				// is to pass `inert="true"`. We pair it with `aria-hidden` so
				// AT also skips the hidden rows on browsers without `inert`
				// support (Chrome 102+ / Firefox 112+ / Safari 15.5+).
				inert={ ! expanded ? 'true' : undefined }
				aria-hidden={ ! expanded ? 'true' : undefined }
			>
				{ children }
			</ul>
		</li>
	);
};

MySitesSidebarUnifiedSidebarGroup.propTypes = {
	group: PropTypes.shape( {
		id: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		default_expanded: PropTypes.bool,
		signal: PropTypes.shape( {
			attention: PropTypes.bool,
			count: PropTypes.number,
		} ),
	} ).isRequired,
	children: PropTypes.node,
	customizable: PropTypes.bool,
	className: PropTypes.string,
	siteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	expanded: PropTypes.bool,
	onToggle: PropTypes.func,
};

export default MySitesSidebarUnifiedSidebarGroup;
