/**
 * MySitesSidebarUnifiedItem
 *
 * Renders a sidebar menu item with no child items.
 * This could be a top level item, or a child item nested under a top level menu.
 * These two cases might be to be split up?
 *
 * Phase 1 task 1.5 addition: optional `signal` prop carries the redesigned
 * admin-menu shape (`AdminMenuSignal`). When present, the item renders a
 * `<SignalBadge>` next to the title using the public plugin's priority chain
 * (`numeric_badge → count → badge`) plus `inline_text` / `inline_icon`
 * decorative side-channels. Items without a `signal` keep the legacy
 * `badge` / `count` / `inlineIcon` paths so the rollout is purely additive
 * — nothing changes for items the redesigned endpoint hasn't reached yet.
 *
 * Both ungrouped (top-level) and grouped (children of `<MySitesSidebarUnifiedSidebarGroup>`)
 * items pass through this component, so plumbing `signal` here covers both
 * surfaces by construction.
 *
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/signal.js
 * @see ./signal-badge.tsx
 */

import clsx from 'clsx';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useDispatch } from 'react-redux';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import SidebarItem from 'calypso/layout/sidebar/item';
import { collapseAllMySitesSidebarSections } from 'calypso/state/my-sites/sidebar/actions';
import SignalBadge from './signal-badge';
import MySitesSidebarUnifiedStatsSparkline from './sparkline';

export const MySitesSidebarUnifiedItem = ( {
	badge,
	count,
	icon,
	inlineIcon,
	isSubItem = false,
	selected = false,
	slug,
	title,
	url,
	className = '',
	shouldOpenExternalLinksInCurrentTab,
	showTooltip = false,
	forceExternalLink = false,
	forceShowExternalIcon = false,
	forceChevronIcon = false,
	trackClickEvent,
	signal,
} ) => {
	const reduxDispatch = useDispatch();

	const onNavigate = () => {
		if ( typeof trackClickEvent === 'function' ) {
			trackClickEvent( url );
		}

		reduxDispatch( collapseAllMySitesSidebarSections() );
		window.scrollTo( 0, 0 );
	};

	return (
		<SidebarItem
			badge={ badge }
			count={ count }
			label={ title }
			labelSuffix={ <SignalBadge signal={ signal } /> }
			tooltip={ showTooltip ? title : undefined }
			link={ url }
			onNavigate={ onNavigate }
			selected={ selected }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
			inlineIcon={ inlineIcon }
			forceInternalLink={ shouldOpenExternalLinksInCurrentTab }
			forceExternalLink={ forceExternalLink }
			forceShowExternalIcon={ forceShowExternalIcon }
			forceChevronIcon={ forceChevronIcon }
			className={ clsx(
				isSubItem ? 'sidebar__menu-item--child' : 'sidebar__menu-item-parent',
				className
			) }
		>
			<MySitesSidebarUnifiedStatsSparkline slug={ slug } />
		</SidebarItem>
	);
};

MySitesSidebarUnifiedItem.propTypes = {
	badge: PropTypes.string,
	count: PropTypes.number,
	icon: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
	sectionId: PropTypes.string,
	slug: PropTypes.string,
	title: PropTypes.string,
	showTooltip: PropTypes.bool,
	url: PropTypes.string,
	shouldOpenExternalLinksInCurrentTab: PropTypes.bool.isRequired,
	forceExternalLink: PropTypes.bool,
	forceShowExternalIcon: PropTypes.bool,
	forceChevronIcon: PropTypes.bool,
	trackClickEvent: PropTypes.func,
	// Optional `signal` from the redesigned `/wpcom/v2/admin-menu` shape.
	// `null` / undefined = legacy item with no signal data. Type-shape lives
	// in `client/state/admin-menu/types.ts` (`AdminMenuSignal`).
	signal: PropTypes.shape( {
		count: PropTypes.number,
		numeric_badge: PropTypes.number,
		badge: PropTypes.string,
		inline_text: PropTypes.string,
		inline_icon: PropTypes.string,
		attention: PropTypes.bool,
	} ),
};

export default memo( MySitesSidebarUnifiedItem );
