import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useI18n } from '@wordpress/react-i18n';
import { connect } from 'react-redux';
import { domainManagementRoot, domainManagementTransferIn } from 'calypso/my-sites/domains/paths';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import './style.scss';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

type Props = {
	purchases: ReceiptPurchase[] | undefined;
	manageDomainUrl: string;
};

const DomainsTransferredList = ( { purchases, manageDomainUrl }: Props ) => {
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
					href={ manageDomainUrl }
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

export default connect( ( state, ownProps: { purchases: ReceiptPurchase[] } ) => {
	let manageDomainUrl = '/domains/manage';
	if ( ownProps.purchases?.length === 1 ) {
		const { blogId, meta } = ownProps.purchases[ 0 ];
		const siteSlug = getSiteSlug( state, blogId );
		manageDomainUrl = domainManagementTransferIn( siteSlug ?? '', meta, domainManagementRoot() );
	}

	return {
		manageDomainUrl,
	};
} )( DomainsTransferredList );
