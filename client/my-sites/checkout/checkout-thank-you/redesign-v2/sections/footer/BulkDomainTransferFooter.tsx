import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import PurchaseDetail from 'calypso/components/purchase-detail';

const BulkDomainTransferFooter = () => {
	const { __ } = useI18n();

	return (
		<div>
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

			<PurchaseDetail
				title={ __( 'Consider moving your sites too?' ) }
				description={ __(
					'You can find step-by-step guides below that will help you move your site to WordPress.com'
				) }
				buttonText={ __( 'Learn more about site transfers' ) }
				href={ localizeUrl( 'https://wordpress.com/support/moving-a-blog/' ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_domain_transfer_complete_click', {
						destination: '/support/moving-a-blog',
					} )
				}
			/>
		</div>
	);
};

export default BulkDomainTransferFooter;
