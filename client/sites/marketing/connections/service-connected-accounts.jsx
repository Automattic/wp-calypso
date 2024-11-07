import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

const SharingServiceConnectedAccounts = ( { children, connect, service, translate } ) => {
	const allowMultipleAccounts = [ 'instagram-basic-display', 'p2_github' ];
	const doesNotAllowMultipleAccounts = [ 'google_plus', 'mastodon', 'bluesky' ];
	const shouldShowConnectButton =
		( 'publicize' === service.type || allowMultipleAccounts.includes( service.ID ) ) &&
		! doesNotAllowMultipleAccounts.includes( service.ID );

	return (
		<div className="connections__sharing-service-accounts-detail">
			<ul className="connections__sharing-service-connected-accounts">{ children }</ul>
			{ shouldShowConnectButton && (
				<Button onClick={ connect }>
					{ translate( 'Connect one more account', {
						comment: 'Sharing: Publicize connections',
					} ) }
				</Button>
			) }
		</div>
	);
};

SharingServiceConnectedAccounts.propTypes = {
	connect: PropTypes.func, // Handler to invoke when adding a new connection
	service: PropTypes.object.isRequired, // The service object
	translate: PropTypes.func,
};

SharingServiceConnectedAccounts.defaultProps = {
	connect: () => {},
};

export default localize( SharingServiceConnectedAccounts );
