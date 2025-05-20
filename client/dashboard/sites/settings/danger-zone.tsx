import { __experimentalHeading as Heading, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAuth } from '../../app/auth';
import { ActionList } from '../../components/action-list';
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
	// See canCurrentUserStartSiteOwnerTransfer.
	if ( site_owner !== user.ID ) {
		return null;
	}

	return (
		<ActionList.ActionItem
			title={ __( 'Transfer site' ) }
			description={ __( 'Transfer ownership of this site to another WordPress.com user.' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					href={ `/sites/${ slug }/settings/transfer-site` }
				>
					{ __( 'Transfer' ) }
				</Button>
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
