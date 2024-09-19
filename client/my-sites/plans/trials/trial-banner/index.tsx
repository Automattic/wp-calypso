import { Card } from '@automattic/components';
import clsx from 'clsx';
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
import useBannerSubtitle from './use-banner-subtitle';
import './style.scss';

interface TrialBannerProps {
	callToAction?: JSX.Element | null;
	isWooExpressTrial?: boolean;
	isEntrepreneurTrial?: boolean;
}

const TrialBanner = ( props: TrialBannerProps ) => {
	const { callToAction, isWooExpressTrial, isEntrepreneurTrial } = props;
	const selectedSiteId = useSelector( getSelectedSiteId ) || -1;

	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, selectedSiteId ) );
	const trialDaysLeft = useSelector( ( state ) =>
		Math.floor( getTrialDaysLeft( state, selectedSiteId ) || 0 )
	);
	const trialExpiration = useSelector( ( state ) => getTrialExpiration( state, selectedSiteId ) );
	const trialExpired = useSelector( ( state ) => isTrialExpired( state, selectedSiteId ) );

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
	const bannerSubtitle = useBannerSubtitle(
		currentPlan?.productSlug,
		trialExpired,
		trialDaysLeftToDisplay,
		trialExpiration,
		selectedSiteId,
		isWooExpressTrial,
		isEntrepreneurTrial
	);

	return (
		<Card className={ clsx( 'trial-banner', { 'entrepreneur-trial': isEntrepreneurTrial } ) }>
			<div className="trial-banner__content">
				<p className="trial-banner__title">{ translate( 'You’re in a free trial' ) }</p>
				<p className="trial-banner__subtitle">{ bannerSubtitle }</p>
				{ callToAction }
			</div>
			<div className="trial-banner__chart-wrapper">
				<DoughnutChart
					progress={ trialProgress }
					text={ trialDaysLeftToDisplay?.toString() }
					isEntrepreneurTrial={ isEntrepreneurTrial }
				/>
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
