import { Count, Badge, Gridicon } from '@automattic/components';
import { Icon, chevronRightSmall, external } from '@wordpress/icons';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
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
	const { icon, customIcon, count, badge } = props;

	let _preloaded = false;

	const itemPreload = () => {
		if ( ! _preloaded && props.preloadSectionName ) {
			_preloaded = true;
			preload();
		}
	};

	const handleNavigate = ( event ) => {
		props.onNavigate?.( event, props.link );
	};

	const expandSectionIfSelected = () => {
		const { expandSection, selected } = props;

		if ( selected && typeof expandSection === 'function' ) {
			expandSection();
		}
	};

	useEffect( expandSectionIfSelected, [ props.selected ] );

	const linkProps = showAsExternal ? { target: '_blank', rel: 'noreferrer' } : {};

	return (
		<li
			className={ classes }
			data-tip-target={ props.tipTarget }
			data-tooltip={ props.tooltip }
			data-post-type={ props.postType }
		>
			<a
				className="sidebar__menu-link"
				onClick={ handleNavigate }
				href={ props.link }
				onMouseEnter={ itemPreload }
				{ ...linkProps }
			>
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
					{ !! count && <Count count={ count } /> }
					{ !! badge && (
						<Badge type="warning-clear" className="sidebar__menu-link-badge">
							{ badge }
						</Badge>
					) }
				</span>
				{ ( showAsExternal || props.forceShowExternalIcon ) && ! sidebarIsCollapsed && (
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
};
