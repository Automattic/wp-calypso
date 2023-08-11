import { Card } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import {
	getTrialDaysLeft,
	getTrialExpiration,
	isTrialExpired,
} from 'calypso/state/sites/plans/selectors/trials/trials-expiration';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DoughnutChart from '../../doughnut-chart';

import './style.scss';

interface TrialBannerProps {
	callToAction?: JSX.Element | null;
}

const TrialBanner = ( props: TrialBannerProps ) => {
	const { callToAction } = props;
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;

	const { currentPlan, trialDaysLeft, trialExpired, trialExpiration } = useSelector(
		( state ) => ( {
			currentPlan: getCurrentPlan( state, selectedSiteId ),
			trialExpired: isTrialExpired( state, selectedSiteId ),
			trialDaysLeft: Math.floor( getTrialDaysLeft( state, selectedSiteId ) || 0 ),
			trialExpiration: getTrialExpiration( state, selectedSiteId ),
		} )
	);

	const locale = useLocale();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const trialStart = moment.utc( currentPlan?.subscribedDate );
	const trialEnd = moment.utc( currentPlan?.expiryDate );
	const trialDuration = trialEnd.diff( trialStart, 'days' );

	/**
	 * Trial progress from 0 to 1
	 */
	let trialProgress = Math.min( trialDaysLeft / trialDuration, 1 );
	trialProgress = Math.max( trialProgress, 0 );
	const trialDaysLeftToDisplay = trialExpired ? 0 : trialDaysLeft;

	// moment.js doesn't have a format option to display the long form in a localized way without the year
	// https://github.com/moment/moment/issues/3341
	const readableExpirationDate = trialExpiration?.toDate().toLocaleDateString( locale, {
		month: 'long',
		day: 'numeric',
	} );

	return (
		<Card className="trial-banner">
			<div className="trial-banner__content">
				<p className="trial-banner__title">{ translate( 'You’re in a free trial' ) }</p>
				<p className="trial-banner__subtitle">
					{ trialExpired
						? translate(
								'Your free trial has expired. Upgrade to a plan to unlock new features and start selling.'
						  )
						: translate(
								'Your free trial will end in %(daysLeft)d day. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
								'Your free trial will end in %(daysLeft)d days. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
								{
									count: trialDaysLeftToDisplay,
									args: {
										daysLeft: trialDaysLeftToDisplay,
										expirationdate: readableExpirationDate as string,
									},
								}
						  ) }
				</p>
				{ callToAction }
			</div>
			<div className="trial-banner__chart-wrapper">
				<DoughnutChart progress={ trialProgress } text={ trialDaysLeftToDisplay?.toString() } />
				<br />
				<span className="trial-banner__chart-label">
					{ trialExpired
						? translate( 'Your free trial has expired' )
						: translate( 'day left in trial', 'days left in trial', {
								count: trialDaysLeftToDisplay,
						  } ) }
				</span>
			</div>
		</Card>
	);
};

export default TrialBanner;
