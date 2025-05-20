import { __experimentalHeading as Heading } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ActionList } from '../../components/action-list';
import RouterLinkButton from '../../components/router-link-button';
import { useCanTransferSite } from '../hooks/use-can-transfer-site';
import type { Site } from '../../data/types';

const TransferSite = ( { site }: { site: Site } ) => {
	const { slug } = site;

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
	const canTransferSite = useCanTransferSite( { site } );
	const actions = [ canTransferSite && <TransferSite key="transfer-site" site={ site } /> ].filter(
		Boolean
	);

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
