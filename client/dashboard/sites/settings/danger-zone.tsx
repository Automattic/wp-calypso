import { __experimentalHeading as Heading } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAuth } from '../../app/auth';
import { ActionList } from '../../components/action-list';
import RouterLinkButton from '../../components/router-link-button';
import type { Site } from '../../data/types';

const TransferSite = ( { site }: { site: Site } ) => {
	const { site_owner, slug } = site;
	const { user } = useAuth();

	// TODO: The following types of the site are not allowed to transfer the ownership:
	// * NonAtomicJetpackSite
	// * P2 Hub
	// * WP For Teams
	// * VIP Site
	// * Staging site
	// We may need to handle this via endpoint somewhere. See canCurrentUserStartSiteOwnerTransfer.
	if ( site_owner !== user.ID ) {
		return null;
	}

	return (
		<ActionList.ActionItem
			title={ __( 'Transfer site' ) }
			description={ __( 'Transfer ownership of this site to another WordPress.com user.' ) }
			actions={
				<RouterLinkButton
					variant="secondary"
					size="compact"
					to={ `/sites/${ slug }/settings/transfer-site` }
				>
					{ __( 'Transfer' ) }
				</RouterLinkButton>
			}
		/>
	);
};

export default function DangerZone( { site }: { site: Site } ) {
	const actions = [ <TransferSite key="transfer-site" site={ site } /> ].filter( Boolean );

	if ( ! actions.length ) {
		return null;
	}

	return (
		<>
			<Heading>{ __( 'Danger zone' ) }</Heading>
			<ActionList>{ actions }</ActionList>
		</>
	);
}
