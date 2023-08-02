import { getPlan, PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import {
	getMigrationTrialDaysLeft,
	getMigrationTrialExpiration,
	isMigrationTrialExpired,
} from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import TrialPlanBanner from '../../components/trial-plan-banner';

interface BusinessTrialBannerProps {
	callToAction?: JSX.Element | null;
}

const BusinessTrialBanner = ( props: BusinessTrialBannerProps ) => {
	const translate = useTranslate();

	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;

	const { trialDaysLeft, isTrialExpired, trialExpiration } = useSelector( ( state ) => ( {
		isTrialExpired: isMigrationTrialExpired( state, selectedSiteId ),
		trialDaysLeft: Math.floor( getMigrationTrialDaysLeft( state, selectedSiteId ) || 0 ),
		trialExpiration: getMigrationTrialExpiration( state, selectedSiteId ),
	} ) );

	return (
		<TrialPlanBanner
			siteId={ selectedSiteId }
			callToAction={ props.callToAction }
			isTrialExpired={ isTrialExpired ?? false }
			trialDaysLeft={ trialDaysLeft }
			trialExpiration={ trialExpiration }
			title={ translate( 'You are in a free trial' ) }
			subtitle={ ( isTrialExpired, daysLeft, readableExpirationDate ) =>
				isTrialExpired
					? translate(
							'Your free trial has expired. Upgrade to a plan to unlock new features and start selling.'
					  )
					: translate(
							'Your free trial ends in {{b}}%(daysLeft)d day{{/b}}. Upgrade to a %(planName)s plan by %(expirationdate)s to unlock all the features.',
							'Your free trial ends in {{b}}%(daysLeft)d days{{/b}}. Upgrade to a %(planName)s plan by %(expirationdate)s to unlock all the features.',
							{
								count: daysLeft,
								args: {
									daysLeft,
									expirationdate: readableExpirationDate,
									planName: getPlan( PLAN_BUSINESS_MONTHLY )?.getTitle() || '',
								},
								components: {
									b: <strong />,
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

export default BusinessTrialBanner;
