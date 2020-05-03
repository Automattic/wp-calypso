/**
 * External dependencies
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Gridicon from 'components/gridicon';
import { isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import { isExternal } from 'lib/url';
import MaterialIcon from 'components/material-icon';
import { preload } from 'sections-helper';
import TranslatableString from 'components/translatable/proptype';

export default function SidebarItem( props ) {
	const isExternalLink = isExternal( props.link );
	const showAsExternal = isExternalLink && ! props.forceInternalLink;
	const classes = classnames( props.className, { selected: props.selected } );
	const { materialIcon, materialIconStyle, icon, customIcon } = props;

	let _preloaded = false;

	const itemPreload = () => {
		if ( ! _preloaded && props.preloadSectionName ) {
			_preloaded = true;
			preload();
		}
	};

	const expandSectionIfSelected = () => {
		const { expandSection, selected } = props;

		if ( selected && isFunction( expandSection ) ) {
			expandSection();
		}
	};

	useEffect( expandSectionIfSelected, [ props.selected ] );

	return (
		<li className={ classes } data-tip-target={ props.tipTarget } data-post-type={ props.postType }>
			<a
				className="sidebar__menu-link"
				onClick={ props.onNavigate }
				href={ props.link }
				target={ showAsExternal ? '_blank' : null }
				rel={ isExternalLink ? 'noopener noreferrer' : null }
				onMouseEnter={ itemPreload }
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
					{ props.label }
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
};
