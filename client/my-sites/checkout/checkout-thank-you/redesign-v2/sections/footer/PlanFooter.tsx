import { translate } from 'i18n-calypso';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const PlanFooter = () => {
	return (
		<div>
			<PurchaseDetail
				title={ translate( 'A site refresh' ) }
				description={ translate(
					'A new look and feel can help you stand our from the crowd. Get a new theme and make an impression.'
				) }
				buttonText={ translate( 'Find your new theme' ) }
				href="/themes"
				onClick={ recordTracksEvent( 'calypso_plan_thank_you_theme_click' ) }
			/>

			<PurchaseDetail
				title={ translate( 'Everything you need to know' ) }
				description={ translate(
					'Explore our support guides and find an answer to every question.'
				) }
				buttonText={ translate( 'Explore support resources' ) }
				href="/support"
				onClick={ recordTracksEvent( 'calypso_plan_thank_you_support_click' ) }
			/>
		</div>
	);
};

export default PlanFooter;
