import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import getRemovableConnections from 'calypso/state/selectors/get-removable-connections';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const SharingServiceAction = ( {
	isConnecting,
	isDisconnecting,
	isRefreshing,
	onAction,
	removableConnections,
	service,
	status,
	translate,
	recordTracksEvent,
	path,
	isExpanded,
} ) => {
	let warning = false;
	let label;

	const isPending = 'unknown' === status || isDisconnecting || isRefreshing || isConnecting;
	const onClick = ( event ) => {
		event.stopPropagation();
		onAction();
	};

	if ( 'unknown' === status ) {
		label = translate( 'Loading…', { context: 'Sharing: Publicize status pending button label' } );
	} else if ( isDisconnecting ) {
		label = translate( 'Disconnecting…', {
			context: 'Sharing: Publicize disconnect pending button label',
		} );
	} else if ( isRefreshing ) {
		label = translate( 'Reconnecting…', {
			context: 'Sharing: Publicize reconnect pending button label',
		} );
	} else if ( isConnecting ) {
		label = translate( 'Connecting…', {
			context: 'Sharing: Publicize connect pending button label',
		} );
	} else if ( 'connected' === status || 'must-disconnect' === status ) {
		if ( removableConnections.length > 1 ) {
			label = translate( 'Disconnect All', {
				context: 'Sharing: Publicize disconnect button label',
			} );
		} else {
			label = translate( 'Disconnect', { context: 'Sharing: Publicize disconnect button label' } );
		}
		warning = true;
	} else if ( 'reconnect' === status || 'refresh-failed' === status ) {
		label = translate( 'Reconnect', {
			context: 'Sharing: Publicize reconnect pending button label',
		} );
	} else {
		label = translate( 'Connect', { context: 'Sharing: Publicize connect pending button label' } );
	}

	if ( 'google_plus' === service.ID && 1 > removableConnections.length ) {
		label = translate( 'Unavailable', {
			context: 'Sharing: Publicize connect unavailable button label',
		} );
		return (
			<Button compact disabled>
				{ label }
			</Button>
		);
	}

	// See: https://developers.google.com/photos/library/guides/ux-guidelines
	if ( 'google_photos' === service.ID && ! path?.startsWith( '/marketing/connections/' ) ) {
		return (
			<Button primary onClick={ onClick } disabled={ isPending }>
				{ translate( 'Connect to Google Photos' ) }
			</Button>
		);
	}

	if ( 'mailchimp' === service.ID && status === 'not-connected' ) {
		return (
			<div>
				<Button
					className="connections__signup"
					compact
					href="https://public-api.wordpress.com/rest/v1.1/sharing/mailchimp/signup"
					onClick={ () => {
						recordTracksEvent( 'calypso_connections_signup_button_click', {
							service: 'mailchimp',
							path,
						} );
						return true;
					} }
					target="_blank"
					disabled={ isPending }
				>
					{ translate( 'Sign up' ) }
				</Button>
				<Button scary={ warning } compact onClick={ onClick } disabled={ isPending }>
					{ label }
				</Button>
			</div>
		);
	}

	if ( 'mastodon' === service.ID || 'bluesky' === service.ID ) {
		return (
			<Button
				scary={ warning }
				compact
				onClick={
					[ 'connected', 'must-disconnect' ].includes( status ) && removableConnections.length >= 1
						? onClick
						: null
				}
			>
				{ isExpanded && removableConnections.length === 0 ? (
					<>
						<Gridicon icon="cross-small" size={ 16 } />
						<span>{ translate( 'Cancel' ) }</span>
					</>
				) : (
					label
				) }
			</Button>
		);
	}

	return (
		<Button scary={ warning } compact onClick={ onClick } disabled={ isPending }>
			{ 'reconnect' === status || 'refresh-failed' === status || isRefreshing ? (
				<Gridicon icon="notice-outline" size={ 16 } />
			) : null }
			<span>{ label }</span>
		</Button>
	);
};

SharingServiceAction.propTypes = {
	isConnecting: PropTypes.bool,
	isDisconnecting: PropTypes.bool,
	isRefreshing: PropTypes.bool,
	onAction: PropTypes.func,
	removableConnections: PropTypes.arrayOf( PropTypes.object ),
	service: PropTypes.object.isRequired,
	status: PropTypes.string,
	translate: PropTypes.func,
	recordTracksEvent: PropTypes.func,
	isExpanded: PropTypes.bool,
};

SharingServiceAction.defaultProps = {
	isConnecting: false,
	isDisconnecting: false,
	isRefreshing: false,
	onAction: () => {},
	removableConnections: [],
	status: 'unknown',
};

export default connect(
	( state, { service } ) => {
		const siteId = getSelectedSiteId( state );

		return {
			removableConnections: getRemovableConnections( state, service.ID ),
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( localize( SharingServiceAction ) );
