import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useI18n } from '@wordpress/react-i18n';
import { domainManagementRoot, domainManagementTransferIn } from 'calypso/my-sites/domains/paths';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

type Props = {
	purchase: ReceiptPurchase;
};

const DomainsTransferredListItem = ( { purchase }: Props ) => {
	const { __ } = useI18n();
	const { meta, blogId } = purchase;

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, blogId ) );

	const href = domainManagementTransferIn( siteSlug ?? '', meta, domainManagementRoot() );

	const handleUserClick = ( destination: string ) => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination,
		} );
	};

	return (
		<li className="domain-complete-list-item" key={ meta }>
			<div>
				<h2>{ meta }</h2>
				<p>{ __( 'Auto-renew enabled' ) }</p>
			</div>
			<a
				href={ href }
				className="components-button is-secondary"
				onClick={ () => handleUserClick( href ) }
			>
				{ __( 'Manage domain' ) }
			</a>
		</li>
	);
};

export default DomainsTransferredListItem;
