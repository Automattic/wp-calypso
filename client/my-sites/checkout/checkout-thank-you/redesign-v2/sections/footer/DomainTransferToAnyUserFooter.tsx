import { translate } from 'i18n-calypso';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

import './style.scss';

const DomainTransferToAnyUserFooter = () => {
	return (
		<div className="checkout-thank-you__purchase-details-list">
			<div>
				<PurchaseDetail
					title={ translate( 'Dive into domain essentials' ) }
					description={ translate(
						'Check out our support documentation for step-by-step instructions and expert guidance on your domain set up.'
					) }
					buttonText={ translate( 'Master the domain basics' ) }
					href="/support/domains"
					onClick={ () =>
						recordTracksEvent( 'calypso_domain_transfer_to_any_user_support_domains_click' )
					}
				/>
				<PurchaseDetail
					title={ translate( 'Your go-to domain resource' ) }
					description={ translate(
						'Dive into our comprehensive support documentation to learn the basics of domains, from registration to management.'
					) }
					buttonText="Domain support resources"
					href="/support/category/domains-and-email"
					onClick={ () =>
						recordTracksEvent(
							'calypso_domain_transfer_to_any_user_support_domains-and-email_click'
						)
					}
				/>
			</div>
		</div>
	);
};

export default DomainTransferToAnyUserFooter;
