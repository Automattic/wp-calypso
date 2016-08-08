/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import {
	get,
	identity
} from 'lodash';

/**
 * Internal dependencies
 */
import SocialLogo from 'components/social-logo';

const services = translate => ( {
	facebook: { icon: 'facebook', label: translate( 'Facebook feed' ) },
	google: { icon: 'google-plus-alt', label: translate( 'Google search' ) },
	linkedin: { icon: 'linkedin', label: translate( 'LinkedIn share' ) },
	twitter: { icon: 'twitter', label: translate( 'Twitter card' ) },
	wordpress: { icon: 'wordpress', label: translate( 'WordPress.com reader' ) }
} );

export const SocialItem = props => {
	const {
		isSelected,
		onClick,
		service,
		translate
	} = props;

	const { icon, label } = get( services( translate ), service );
	const classes = classNames(
		'vertical-menu__social-item',
		'vertical-menu__items',
		{ 'is-selected': isSelected }
	);

	return (
		<div className={ classes } onClick={ () => onClick( service ) }>
			<div className="vertical-menu__items__social-icon">
				<SocialLogo icon={ icon } size={ 24 } />
			</div>
			<span className="vertical-menu__items__social-label">
				{ label }
			</span>
		</div>
	);
};

SocialItem.propTypes = {
	isSelected: PropTypes.bool,
	onClick: PropTypes.func,
	service: PropTypes.oneOf( Object.keys( services( identity ) ) ).isRequired,
	translate: PropTypes.func
};

SocialItem.defaultProps = {
	isSelected: false,
	onClick: identity,
	translate: identity
};

export default localize( SocialItem );
