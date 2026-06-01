import { Count, Badge, Gridicon } from '@automattic/components';
import { Icon, chevronRightSmall, external } from '@wordpress/icons';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { isExternal } from 'calypso/lib/url';
import { preload } from 'calypso/sections-helper';
import { getSidebarIsCollapsed } from 'calypso/state/ui/selectors';

export default function SidebarItem( props ) {
	const isExternalLink = isExternal( props.link );
	const showAsExternal = ( isExternalLink && ! props.forceInternalLink ) || props.forceExternalLink;
	const classes = clsx( props.className, props.tipTarget, {
		selected: props.selected,
		'has-unseen': props.hasUnseen,
		'tooltip tooltip-right': !! props.tooltip,
	} );
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );
	const { icon, customIcon, count, badge, inlineIcon } = props;
	const selected = props.selected;
	const expandSectionRef = useRef( props.expandSection );
	expandSectionRef.current = props.expandSection;

	let _preloaded = false;

	const itemPreload = () => {
		if ( ! _preloaded && props.preloadSectionName ) {
			_preloaded = true;
			preload();
		}
	};

	const handleNavigate = ( event ) => {
		if ( props.preventLinkNavigation ) {
			event?.preventDefault();
			return;
		}
		props.onNavigate?.( event, props.link );
	};

	useEffect( () => {
		if ( selected && typeof expandSectionRef.current === 'function' ) {
			expandSectionRef.current();
		}
	}, [ selected ] );

	const linkProps = showAsExternal ? { target: '_blank', rel: 'noreferrer' } : {};

	return (
		<li
			className={ classes }
			data-tip-target={ props.tipTarget }
			data-tooltip={ props.tooltip }
			data-post-type={ props.postType }
			// Optional pass-through for the wp-admin-sidebar redesign so the
			// customize mode's drag-drop can find reassignable rows by id
			// (Phase 2 task 2.2). Undefined for items without an itemId so
			// the attribute is omitted entirely on legacy callers — keeps
			// existing snapshots stable.
			data-wp-admin-sidebar-item-id={ props.wpAdminSidebarItemId }
		>
			<a
				className="sidebar__menu-link"
				onClick={ handleNavigate }
				href={ props.link }
				tabIndex={ props.linkTabIndex }
				onMouseEnter={ itemPreload }
				{ ...linkProps }
			>
				{ /*
				 * Optional content rendered as the FIRST child of the link.
				 * Used by the wp-admin-sidebar customize mode to inject the
				 * drag grip (`.admin-sidebar-item__grip`) before the icon —
				 * mirrors the public plugin's `link.insertBefore(grip, link.firstChild)`
				 * decoration. Undefined for legacy callers so the existing
				 * render is byte-identical when no grip is passed.
				 */ }
				{ props.prependContent }
				{ icon &&
					( typeof icon === 'string' ? (
						<Gridicon className="sidebar__menu-icon" icon={ icon } size={ 24 } />
					) : (
						<Icon icon={ icon } className="sidebar__menu-icon" size={ 24 } />
					) ) }

				{ customIcon && customIcon }

				{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
				<span className="sidebar__menu-link-text menu-link-text" data-e2e-sidebar={ props.label }>
					{
						// String labels should be sanitized, whereas React components should be rendered as is
						'string' === typeof props.label
							? stripHTML( decodeEntities( props.label ) )
							: props.label
					}
					{ props.labelSuffix }
					{ !! count && <Count count={ count } /> }
					{ !! badge && (
						<Badge type="warning-clear" className="sidebar__menu-link-badge">
							{ badge }
						</Badge>
					) }
				</span>
				{ inlineIcon && (
					<span className={ 'sidebar__inline-icon dashicons-before ' + inlineIcon } aria-hidden />
				) }
				{ ( showAsExternal || props.forceShowExternalIcon ) &&
					! ( sidebarIsCollapsed || props.sidebarIsCollapsed ) && (
						<Icon icon={ external } size={ 18 } />
					) }
				{ props.forceChevronIcon && <Icon icon={ chevronRightSmall } size={ 24 } /> }
				{ props.children }
			</a>
		</li>
	);
}

SidebarItem.propTypes = {
	label: TranslatableString.isRequired,
	tooltip: TranslatableString,
	className: PropTypes.string,
	link: PropTypes.string.isRequired,
	onNavigate: PropTypes.func,
	icon: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func, PropTypes.object ] ),
	customIcon: PropTypes.object,
	selected: PropTypes.bool,
	expandSection: PropTypes.func,
	preloadSectionName: PropTypes.string,
	forceExternalLink: PropTypes.bool,
	forceInternalLink: PropTypes.bool,
	forceShowExternalIcon: PropTypes.bool,
	testTarget: PropTypes.string,
	tipTarget: PropTypes.string,
	count: PropTypes.number,
	badge: PropTypes.string,
	sidebarIsCollapsed: PropTypes.bool,
	inlineIcon: PropTypes.string,
	labelSuffix: PropTypes.node,
	// Compound itemId for the wp-admin-sidebar redesign:
	// `<sourceKind>:<ref>:<parent>:<slug>`.
	// Optional. Drives the `data-wp-admin-sidebar-item-id` attribute the customize
	// mode's drag-drop hook reads to find reassignable rows.
	wpAdminSidebarItemId: PropTypes.string,
	// Optional content rendered as the first child of the link. Used by the
	// wp-admin-sidebar customize mode to inject the drag grip.
	prependContent: PropTypes.node,
	// Optional override for callers that need to remove the anchor from the
	// tab order while keeping the row's visual link structure.
	linkTabIndex: PropTypes.number,
	// Suppresses anchor navigation when a caller uses the row for a custom
	// interaction mode.
	preventLinkNavigation: PropTypes.bool,
};
