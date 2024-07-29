import { FormToggle, BaseControl } from '@wordpress/components';
import clsx from 'clsx';
import SocialLogo from 'calypso/components/social-logo';
import cssSafeUrl from 'calypso/lib/css-safe-url';

function serviceToIconName( service ) {
	switch ( service ) {
		case 'google_plus':
			return 'google-plus';
		case 'instagram-business':
			return 'instagram';

		default:
			return service;
	}
}

function hasRoundIcon( service ) {
	return [ 'facebook', 'nextdoor' ].includes( service );
}

const PostShareConnection = ( { connection, isActive, onToggle } ) => {
	const { external_display, external_profile_picture, keyring_connection_ID, service, status } =
		connection;

	const toggle = () => onToggle( keyring_connection_ID );

	const classes = clsx( {
		'post-share__service': true,
		[ service ]: true,
		'is-active': isActive,
		'is-broken': status === 'broken',
	} );

	const id = `post-share__label-${ keyring_connection_ID }`;

	const accountImageStyle = {};
	if ( external_profile_picture ) {
		accountImageStyle.backgroundImage = 'url( ' + cssSafeUrl( external_profile_picture ) + ' )';
	} else {
		accountImageStyle.backgroundColor = 'rgb( 168, 190, 206 )';
	}

	return (
		<div onClick={ toggle } className={ classes } role="presentation">
			<div className="post-share__service-account-image" style={ accountImageStyle }>
				&nbsp;
			</div>

			<div
				className={ clsx( 'post-share__service-account-social-logo', {
					'is-round': hasRoundIcon( service ),
				} ) }
			>
				<SocialLogo icon={ serviceToIconName( service ) } />
			</div>

			<div className="post-share__service-account-name">
				<label id={ id }>{ external_display }</label>
			</div>
			<BaseControl className={ clsx( 'components-toggle-control' ) }>
				<FormToggle checked={ isActive } aria-describedby={ id } />
			</BaseControl>
		</div>
	);
};

export default PostShareConnection;
