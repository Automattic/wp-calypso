import { Button, Card } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	getCurrentPlan,
	getECommerceTrialDaysLeft,
	getECommerceTrialExpiration,
	isECommerceTrialExpired,
} from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DoughnutChart from '../../doughnut-chart';

import './style.scss';

interface ECommerceTrialBannerProps {
	showButton?: boolean;
	onClick?: () => void;
}

const ECommerceTrialBanner = ( props: ECommerceTrialBannerProps ) => {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;

	const { currentPlan, eCommerceTrialDaysLeft, isTrialExpired, eCommerceTrialExpiration } =
		useSelector( ( state ) => ( {
			currentPlan: getCurrentPlan( state, selectedSiteId ),
			isTrialExpired: isECommerceTrialExpired( state, selectedSiteId ),
			eCommerceTrialDaysLeft: Math.round( getECommerceTrialDaysLeft( state, selectedSiteId ) || 0 ),
			eCommerceTrialExpiration: getECommerceTrialExpiration( state, selectedSiteId ),
		} ) );

	const locale = useLocale();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const trialStart = moment.utc( currentPlan?.subscribedDate );
	const trialEnd = moment.utc( currentPlan?.expiryDate );
	const trialDuration = trialEnd.diff( trialStart, 'days' );

	/**
	 * Trial progress from 0 to 1
	 */
	const trialProgress = 1 - eCommerceTrialDaysLeft / trialDuration;
	const eCommerceTrialDaysLeftToDisplay = isTrialExpired ? 0 : eCommerceTrialDaysLeft;

	// moment.js doesn't have a format option to display the long form in a localized way without the year
	// https://github.com/moment/moment/issues/3341
	const readableExpirationDate = eCommerceTrialExpiration?.toDate().toLocaleDateString( locale, {
		month: 'long',
		day: 'numeric',
	} );

	return (
		<Card className="e-commerce-trial-banner">
			<div className="e-commerce-trial-banner__content">
				<p className="e-commerce-trial-banner__title">{ translate( 'You’re in a free trial' ) }</p>
				<p className="e-commerce-trial-banner__subtitle">
					{ isTrialExpired
						? translate(
								'Your free trial has expired. Upgrade to a plan to unlock new features and start selling.'
						  )
						: translate(
								'Your free trial will end in %(daysLeft)d day. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
								'Your free trial will end in %(daysLeft)d days. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
								{
									count: eCommerceTrialDaysLeftToDisplay,
									args: {
										daysLeft: eCommerceTrialDaysLeftToDisplay,
										expirationdate: readableExpirationDate,
									},
								}
						  ) }
				</p>
				{ props.showButton && (
					<Button
						className="e-commerce-trial-current-plan__trial-card-cta"
						primary
						onClick={ props.onClick }
					>
						{ translate( 'Upgrade now' ) }
					</Button>
				) }
			</div>
			<div className="e-commerce-trial-banner__chart-wrapper">
				<DoughnutChart
					progress={ trialProgress }
					text={ eCommerceTrialDaysLeftToDisplay?.toString() }
				/>
				<br />
				<span className="e-commerce-trial-banner__chart-label">
					{ isTrialExpired
						? translate( 'Your free trial has expired' )
						: translate( 'day left in trial', 'days left in trial', {
								count: eCommerceTrialDaysLeftToDisplay,
						  } ) }
				</span>
			</div>
		</Card>
	);
};

export default ECommerceTrialBanner;
