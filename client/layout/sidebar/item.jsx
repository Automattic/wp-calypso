/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { isExternal } from 'calypso/lib/url';
import MaterialIcon from 'calypso/components/material-icon';
import Count from 'calypso/components/count';
import { preload } from 'calypso/sections-helper';
import TranslatableString from 'calypso/components/translatable/proptype';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';

export default function SidebarItem( props ) {
	const isExternalLink = isExternal( props.link );
	const showAsExternal = isExternalLink && ! props.forceInternalLink;
	const classes = classnames( props.className, props.tipTarget, {
		selected: props.selected,
		'has-unseen': props.hasUnseen,
	} );
	const { materialIcon, materialIconStyle, icon, customIcon, count } = props;

	let _preloaded = false;

	const itemPreload = () => {
		if ( ! _preloaded && props.preloadSectionName ) {
			_preloaded = true;
			preload();
		}
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
		<li className={ classes } data-tip-target={ props.tipTarget } data-post-type={ props.postType }>
			<a
				className="sidebar__menu-link"
				onClick={ props.onNavigate }
				href={ props.link }
				onMouseEnter={ itemPreload }
				{ ...linkProps }
			>
				{ icon && <Gridicon className={ 'sidebar__menu-icon' } icon={ icon } size={ 24 } /> }

				{ materialIcon && (
					<MaterialIcon
						className={ 'sidebar__menu-icon' }
						icon={ materialIcon }
						style={ materialIconStyle }
					/>
				) }

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
				</span>
				{ showAsExternal && <Gridicon icon="external" size={ 24 } /> }
				{ props.children }
			</a>
		</li>
	);
}

SidebarItem.propTypes = {
	label: TranslatableString.isRequired,
	className: PropTypes.string,
	link: PropTypes.string.isRequired,
	onNavigate: PropTypes.func,
	icon: PropTypes.string,
	customIcon: PropTypes.object,
	materialIcon: PropTypes.string,
	materialIconStyle: PropTypes.string,
	selected: PropTypes.bool,
	expandSection: PropTypes.func,
	preloadSectionName: PropTypes.string,
	forceInternalLink: PropTypes.bool,
	testTarget: PropTypes.string,
	tipTarget: PropTypes.string,
	count: PropTypes.number,
};
