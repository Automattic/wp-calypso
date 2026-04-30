import { Card } from '@wordpress/components';
import PodcastingNoPermissionsMessage from 'calypso/my-sites/site-settings/podcasting-details/no-permissions';
import PodcastingNotSupportedMessage from 'calypso/my-sites/site-settings/podcasting-details/not-supported';
import PodcastingPrivateSiteMessage from 'calypso/my-sites/site-settings/podcasting-details/private-site';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

const DEFAULT_CLASSNAME = 'site-settings__card podcast__card';

const useAccessGate = ( className: string = DEFAULT_CLASSNAME ) => {
	const siteId = useSelector( getSelectedSiteId );
	const site = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAutomatedTransfer = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isPrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const isComingSoon = useSelector( ( state ) => isSiteComingSoon( state, siteId ) );
	const userCanManagePodcasting = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);
	const isUnsupportedSite = isJetpack && ! isAutomatedTransfer;

	if ( ! site || ! siteId ) {
		return null;
	}

	// Mirror the legacy /settings/podcasting gating so /podcasting does not
	// expose flows that are unsupported elsewhere in product.
	if ( isPrivate ) {
		return (
			<Card className={ className }>
				<PodcastingPrivateSiteMessage isComingSoon={ isComingSoon } />
			</Card>
		);
	}

	if ( ! userCanManagePodcasting ) {
		return (
			<Card className={ className }>
				<PodcastingNoPermissionsMessage />
			</Card>
		);
	}

	if ( isUnsupportedSite ) {
		return (
			<Card className={ className }>
				<PodcastingNotSupportedMessage />
			</Card>
		);
	}

	return null;
};

export default useAccessGate;
