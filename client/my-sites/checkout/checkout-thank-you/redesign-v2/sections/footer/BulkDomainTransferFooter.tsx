import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import PurchaseDetail from 'calypso/components/purchase-detail';

const BulkDomainTransferFooter = () => {
	const { __ } = useI18n();

	return (
		<div>
			<PurchaseDetail
				title={ __( 'Want to speed this up?' ) }
				description={ __(
					'Check your inbox for an email from your current domain provider for instructions on how to speed up the transfer process.'
				) }
				buttonText={ __( 'Learn about expediting domain transfers' ) }
				href={ localizeUrl( 'https://wordpress.com/support/domains/incoming-domain-transfer/' ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_domain_transfer_complete_click', {
						destination: '/support/domains/incoming-domain-transfer/',
					} )
				}
			/>
			<PurchaseDetail
				title={ __( 'Dive into domain essentials' ) }
				description={ __(
					"Unlock the domain world's secrets. Dive into our comprehensive resource to learn the basics of domains, from registration to management."
				) }
				buttonText={ __( 'Master the domain basics' ) }
				href={ localizeUrl( 'https://wordpress.com/support/domains/' ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_domain_transfer_complete_click', {
						destination: '/support/domains',
					} )
				}
			/>
		</div>
	);
};

export default BulkDomainTransferFooter;
