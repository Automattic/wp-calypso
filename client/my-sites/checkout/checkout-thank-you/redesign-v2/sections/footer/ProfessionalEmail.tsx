import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import professionalEmailImage from 'calypso/assets/images/checkout/professional-email.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { emailManagement } from 'calypso/my-sites/email/paths';

import './style.scss';

type ProfessionalEmailProps = {
	domain: string;
	trackEvent: string;
};

const ProfessionalEmail = ( { domain, trackEvent }: ProfessionalEmailProps ) => {
	const handleClick = () => {
		recordTracksEvent( trackEvent );
	};

	return (
		<div className="checkout-thank-you__footer-professional-email">
			<div className="checkout-thank-you__footer-professional-email-title">
				{ translate( 'This might interest you' ) }
			</div>
			<div className="checkout-thank-you__footer-professional-email-content">
				<div className="checkout-thank-you__footer-professional-email-content-details">
					<div className="checkout-thank-you__footer-professional-email-content-details-image">
						<div className="checkout-thank-you__footer-professional-email-content-details-image-mask"></div>
						<div className="checkout-thank-you__footer-professional-email-content-details-image-content">
							<img
								className="checkout-thank-you__footer-professional-email-image-content-icon"
								alt=""
								src={ professionalEmailImage }
							/>
						</div>
					</div>
					<div className="checkout-thank-you__footer-professional-email-content-text">
						<h3 className="checkout-thank-you__footer-professional-email-content-text-title">
							{ translate( 'Professional email' ) }
						</h3>
						<div className="checkout-thank-you__footer-professional-email-content-text-description">
							{ translate(
								'85% of people trust an email address with a custom domain name over a generic one.'
							) }{ ' ' }
							- { domain }
						</div>
					</div>
				</div>
				<div className="checkout-thank-you__footer-professional-email-content-actions">
					<Button
						variant="primary"
						href={ emailManagement( domain, domain ) }
						onClick={ handleClick }
					>
						{ translate( 'Add email' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ProfessionalEmail;
