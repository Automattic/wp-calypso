import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useI18n } from '@wordpress/react-i18n';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';
import './style.scss';

type Props = {
	purchases: ReceiptPurchase[] | undefined;
};

const DomainsTransferredList = ( { purchases }: Props ) => {
	const { __, _n } = useI18n();

	const handleUserClick = ( destination: string ) => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination,
		} );
	};

	return (
		<>
			<div className="domain-header-buttons">
				<a
					href="/setup/domain-transfer"
					onClick={ () => handleUserClick( '/setup/domain-transfer' ) }
					className="components-button is-secondary"
				>
					{ __( 'Transfer more domains' ) }
				</a>

				<a
					href="/domains/manage?filter=owned-by-me&sortKey=registered-until"
					className="components-button is-primary manage-all-domains"
					onClick={ () => handleUserClick( '/domains/manage' ) }
				>
					{ _n( 'Manage your domain', 'Manage your domains', purchases?.length ?? 0 ) }
				</a>
			</div>
			<div className="domain-complete-summary">
				<ul className="domain-complete-list">
					{ purchases?.map( ( { meta } ) => (
						<li className="domain-complete-list-item" key={ meta }>
							<div>
								<h2>{ meta }</h2>
							</div>
							<p>{ __( 'Auto-renew enabled' ) }</p>
						</li>
					) ) }
				</ul>
			</div>
		</>
	);
};

export default DomainsTransferredList;
