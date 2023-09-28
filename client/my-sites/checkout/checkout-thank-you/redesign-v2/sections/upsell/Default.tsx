import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

import './style.scss';

type DefaultUpsellProps = {
	title: string;
	description: string;
	trackEvent: string;
	icon: string;
	buttonText: string;
	href: string;
	onClick?: () => void;
};

const DefaultUpsell = ( {
	title,
	description,
	trackEvent,
	icon,
	buttonText,
	href,
	onClick,
}: DefaultUpsellProps ) => {
	const handleClick = () => {
		recordTracksEvent( trackEvent );
		if ( onClick ) {
			onClick();
		}
	};

	return (
		<div className="checkout-thank-you__upsell">
			<div className="checkout-thank-you__upsell-title">
				{ translate( 'This might interest you' ) }
			</div>
			<div className="checkout-thank-you__upsell-content">
				<div className="checkout-thank-you__upsell-content-details">
					<div className="checkout-thank-you__upsell-content-details-image">
						<div className="checkout-thank-you__upsell-content-details-image-mask"></div>
						<div className="checkout-thank-you__upsell-content-details-image-content">
							<img className="checkout-thank-you__upsell-image-content-icon" alt="" src={ icon } />
						</div>
					</div>
					<div className="checkout-thank-you__upsell-content-text">
						<h3 className="checkout-thank-you__upsell-content-text-title">{ title }</h3>
						<div className="checkout-thank-you__upsell-content-text-description">
							{ description }
						</div>
					</div>
				</div>
				<div className="checkout-thank-you__upsell-content-actions">
					<Button variant="primary" href={ href } onClick={ handleClick }>
						{ buttonText }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default DefaultUpsell;
