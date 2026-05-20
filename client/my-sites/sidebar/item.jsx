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
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/signal.js
 * @see ./signal-badge.tsx
 */

import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { memo, useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import SidebarItem from 'calypso/layout/sidebar/item';
import { collapseAllMySitesSidebarSections } from 'calypso/state/my-sites/sidebar/actions';
import { useCustomizeContext } from './customize';
import { MoveMenu } from './customize/move-menu';
import SignalBadge from './signal-badge';
import MySitesSidebarUnifiedStatsSparkline from './sparkline';

export function canCustomizeSidebarItem( isCustomizing, itemId, reassignable ) {
	return !! isCustomizing && !! itemId && reassignable === true;
}

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
	itemId,
	reassignable,
} ) => {
	const reduxDispatch = useDispatch();
	const customizeCtx = useCustomizeContext();
	// Render the drag grip + 3-dot more-options trigger only on rows that
	// the customize mode can act on: the orchestrator is mounted AND in
	// customize mode, AND this item carries a compound itemId marked as
	// reassignable by the classifier. The data attribute below is what
	// drag-drop.ts reads, so non-reassignable rows must not receive it.
	const showCustomizeDecorations = canCustomizeSidebarItem(
		customizeCtx?.isCustomizing,
		itemId,
		reassignable
	);
	const isCustomizing = customizeCtx?.isCustomizing === true;
	const gripLabel = title
		? translate( 'Reorder %(label)s', { args: { label: title } } )
		: translate( 'Reorder' );
	const moreLabel = translate( 'More options' );

	const moreRef = useRef( null );
	const [ moveMenuOpen, setMoveMenuOpen ] = useState( false );
	const handleMoreClick = useCallback( ( ev ) => {
		ev.preventDefault();
		ev.stopPropagation();
		setMoveMenuOpen( ( open ) => ! open );
	}, [] );
	const handleMoveMenuClose = useCallback( () => setMoveMenuOpen( false ), [] );

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
			linkTabIndex={ isCustomizing ? -1 : undefined }
			preventLinkNavigation={ isCustomizing }
			wpAdminSidebarItemId={ showCustomizeDecorations ? itemId : undefined }
			prependContent={
				showCustomizeDecorations ? (
					// `<span role="button">` (not <button>) — nested <button>
					// inside <a> is invalid HTML. Tabindex 0 makes the grip
					// the keyboard tab stop the keyboard-reorder hook reads
					// (selector `.admin-sidebar-item__grip`). The unicode
					// `⠿` (U+283F BRAILLE PATTERN DOTS-12345678) is the same
					// glyph the public plugin uses.
					<span
						className="admin-sidebar-item__grip"
						role="button"
						tabIndex={ 0 }
						aria-label={ gripLabel }
					>
						⠿
					</span>
				) : undefined
			}
			className={ clsx(
				isSubItem ? 'sidebar__menu-item--child' : 'sidebar__menu-item-parent',
				className
			) }
		>
			<MySitesSidebarUnifiedStatsSparkline slug={ slug } />
			{ /*
			 * More-options trigger + popover. Rendered only in customize mode
			 * on reassignable rows (mirrors the public plugin's
			 * `move-menu.js#injectTrigger` + `openFor`). drag-drop.ts skips
			 * pointerdown when the target is inside `.admin-sidebar-item__more`,
			 * so clicking the trigger opens the popup without starting a drag.
			 */ }
			{ showCustomizeDecorations && (
				<span
					ref={ moreRef }
					className="admin-sidebar-item__more"
					role="button"
					tabIndex={ 0 }
					aria-label={ moreLabel }
					aria-haspopup="menu"
					aria-expanded={ moveMenuOpen ? 'true' : 'false' }
					onClick={ handleMoreClick }
					onKeyDown={ ( ev ) => {
						if ( ev.key === 'Enter' || ev.key === ' ' ) {
							handleMoreClick( ev );
						}
					} }
				>
					⋯
				</span>
			) }
			{ showCustomizeDecorations && moveMenuOpen && (
				<MoveMenu
					itemId={ itemId }
					itemLabel={ title }
					triggerEl={ moreRef.current }
					onClose={ handleMoveMenuClose }
				/>
			) }
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
	// Compound itemId from the redesigned endpoint — drives the
	// `data-wp-admin-sidebar-item-id` attribute the customize mode's
	// drag-drop reads. Optional; legacy items without it pass through unchanged.
	itemId: PropTypes.string,
	// Classifier flag that controls whether customize mode may move this row.
	reassignable: PropTypes.bool,
};

export default memo( MySitesSidebarUnifiedItem );
