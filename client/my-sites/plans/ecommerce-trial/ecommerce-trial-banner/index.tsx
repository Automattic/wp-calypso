import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import {
	getECommerceTrialDaysLeft,
	getECommerceTrialExpiration,
	isECommerceTrialExpired,
} from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import TrialPlanBanner from '../../components/trial-plan-banner';

// import './style.scss';

interface ECommerceTrialBannerProps {
	callToAction?: JSX.Element | null;
}

const ECommerceTrialBanner = ( props: ECommerceTrialBannerProps ) => {
	const translate = useTranslate();

	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;

	const { eCommerceTrialDaysLeft, isTrialExpired, eCommerceTrialExpiration } = useSelector(
		( state ) => ( {
			isTrialExpired: isECommerceTrialExpired( state, selectedSiteId ),
			eCommerceTrialDaysLeft: Math.floor( getECommerceTrialDaysLeft( state, selectedSiteId ) || 0 ),
			eCommerceTrialExpiration: getECommerceTrialExpiration( state, selectedSiteId ),
		} )
	);

	return (
		<TrialPlanBanner
			siteId={ selectedSiteId }
			className="e-commerce-trial-banner"
			callToAction={ props.callToAction }
			isTrialExpired={ isTrialExpired ?? false }
			trialDaysLeft={ eCommerceTrialDaysLeft }
			trialExpiration={ eCommerceTrialExpiration }
			title={ translate( 'You’re in a free trial' ) }
			subtitle={ ( isTrialExpired, daysLeft, readableExpirationDate ) =>
				isTrialExpired
					? translate(
							'Your free trial has expired. Upgrade to a plan to unlock new features and start selling.'
					  )
					: translate(
							'Your free trial will end in %(daysLeft)d day. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
							'Your free trial will end in %(daysLeft)d days. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
							{
								count: daysLeft,
								args: {
									daysLeft,
									expirationdate: readableExpirationDate,
								},
							}
					  )
			}
			chartLabel={ ( isTrialExpired, daysLeft ) =>
				isTrialExpired
					? translate( 'Your free trial has expired' )
					: translate( 'day left in trial', 'days left in trial', {
							count: daysLeft,
					  } )
			}
		/>
	);
};

export default ECommerceTrialBanner;
