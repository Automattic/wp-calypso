import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import SocialLogo from 'calypso/components/social-logo';

import './style.scss';

const services = ( translate = ( string ) => string ) => ( {
	facebook: { icon: 'facebook', label: translate( 'Facebook' ) },
	'instagram-business': { icon: 'instagram', label: translate( 'Instagram' ) },
	google: { icon: 'google', label: translate( 'Google search' ) },
	google_plus: { icon: 'google-plus', label: translate( 'Google+' ) },
	linkedin: { icon: 'linkedin', label: translate( 'LinkedIn' ) },
	tumblr: { icon: 'tumblr', label: translate( 'Tumblr' ) },
	mastodon: { icon: 'mastodon', label: translate( 'Mastodon' ) },
	x: { icon: 'x', label: translate( 'X' ) },
	wordpress: { icon: 'wordpress', label: translate( 'WordPress.com Reader' ) },
	nextdoor: { icon: 'nextdoor', label: translate( 'Nextdoor' ) },
	threads: { icon: 'threads', label: translate( 'Threads' ) },
} );

const noop = () => {};

export const SocialItem = ( props ) => {
	const { isSelected, onClick, service, translate } = props;

	const { icon, label } = get( services( translate ), service );
	const classes = clsx( 'vertical-menu__social-item', 'vertical-menu__items', {
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
	service: PropTypes.oneOf( Object.keys( services() ) ).isRequired,
	translate: PropTypes.func,
};

SocialItem.defaultProps = {
	isSelected: false,
	onClick: noop,
};

export default localize( SocialItem );
