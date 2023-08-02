import { Card } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import classnames from 'classnames';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import DoughnutChart from '../../doughnut-chart';
import type { Moment } from 'moment';

import './style.scss';

type RenderProp = (
	isTrialExpired: boolean,
	daysLeftToDisplay: number,
	readableExpirationDate: string
) => React.ReactNode;

interface TrialPlanBannerProps {
	siteId: number;
	title: React.ReactNode | RenderProp;
	subtitle: React.ReactNode | RenderProp;
	chartLabel: React.ReactNode | RenderProp;
	isTrialExpired: boolean;
	trialDaysLeft: number;
	trialExpiration: Moment | null;
	callToAction?: JSX.Element | null;
	className?: string;
}

const TrialPlanBanner = ( props: TrialPlanBannerProps ) => {
	const {
		siteId,
		title,
		subtitle,
		chartLabel,
		isTrialExpired,
		trialDaysLeft,
		trialExpiration,
		callToAction,
		className,
	} = props;

	const { currentPlan } = useSelector( ( state ) => ( {
		currentPlan: getCurrentPlan( state, siteId ),
	} ) );

	const locale = useLocale();
	const moment = useLocalizedMoment();

	const trialStart = moment.utc( currentPlan?.subscribedDate );
	const trialEnd = moment.utc( currentPlan?.expiryDate );
	const trialDuration = trialEnd.diff( trialStart, 'days' );

	/**
	 * Trial progress from 0 to 1
	 */
	const trialProgress = Math.min( trialDaysLeft / trialDuration, 1 );
	const daysLeftToDisplay = isTrialExpired ? 0 : trialDaysLeft;

	// moment.js doesn't have a format option to display the long form in a localized way without the year
	// https://github.com/moment/moment/issues/3341
	const readableExpirationDate =
		trialExpiration?.toDate().toLocaleDateString( locale, {
			month: 'long',
			day: 'numeric',
		} ) || '';

	return (
		<Card className={ classnames( 'trial-plan-banner', className ) }>
			<div className="trial-plan-banner__content">
				<p className="trial-plan-banner__title">
					{ typeof title !== 'function'
						? title
						: title( isTrialExpired, daysLeftToDisplay, readableExpirationDate ) }
				</p>
				<p className="trial-plan-banner__subtitle">
					{ typeof subtitle !== 'function'
						? subtitle
						: subtitle( isTrialExpired, daysLeftToDisplay, readableExpirationDate ) }
				</p>
				{ callToAction }
			</div>
			<div className="trial-plan-banner__chart-wrapper">
				<DoughnutChart progress={ trialProgress } text={ daysLeftToDisplay.toString() } />
				<br />
				<span className="trial-plan-banner__chart-label">
					{ typeof chartLabel !== 'function'
						? chartLabel
						: chartLabel( isTrialExpired, daysLeftToDisplay, readableExpirationDate ) }
				</span>
			</div>
		</Card>
	);
};

export default TrialPlanBanner;
