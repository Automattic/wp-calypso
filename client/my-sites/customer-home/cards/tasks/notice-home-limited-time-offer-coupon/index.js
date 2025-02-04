import config from '@automattic/calypso-config';
import JITM from 'calypso/blocks/jitm';

const NoticeHomeLimitedTimeOfferCoupon = () => {
	if ( config.isEnabled( 'jitms' ) ) {
		return (
			<div>
				{ /* Render the JITM component with the desired props */ }
				<JITM messagePath="calypso:home:lto_notices" />
			</div>
		);
	}
};

export default NoticeHomeLimitedTimeOfferCoupon;
