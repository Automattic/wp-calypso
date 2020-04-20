/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, identity } from 'lodash';

/**
 * Internal dependencies
 */
import SocialLogo from 'components/social-logo';

/**
 * Style dependencies
 */
import './style.scss';

const services = ( translate ) => ( {
	facebook: { icon: 'facebook', label: translate( 'Facebook' ) },
	google: { icon: 'google', label: translate( 'Google search' ) },
	google_plus: { icon: 'google-plus', label: translate( 'Google+ ' ) },
	linkedin: { icon: 'linkedin', label: translate( 'LinkedIn' ) },
	tumblr: { icon: 'tumblr', label: translate( 'Tumblr' ) },
	twitter: { icon: 'twitter', label: translate( 'Twitter' ) },
	wordpress: { icon: 'wordpress', label: translate( 'WordPress.com Reader' ) },
} );

export const SocialItem = ( props ) => {
	const { isSelected, onClick, service, translate } = props;

	const { icon, label } = get( services( translate ), service );
	const classes = classNames( 'vertical-menu__social-item', 'vertical-menu__items', {
		'is-selected': isSelected,
	} );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className={ classes } onClick={ () => onClick( service ) } role="presentation">
			<div className="vertical-menu__items__social-icon">
				<SocialLogo icon={ icon } size={ 24 } />
			</div>
			<span className="vertical-menu__items__social-label">{ label }</span>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

SocialItem.propTypes = {
	isSelected: PropTypes.bool,
	onClick: PropTypes.func,
	service: PropTypes.oneOf( Object.keys( services( identity ) ) ).isRequired,
	translate: PropTypes.func,
};

SocialItem.defaultProps = {
	isSelected: false,
	onClick: identity,
	translate: identity,
};

export default localize( SocialItem );
