import { Button, Card } from '@automattic/components';
import classNames from 'classnames';
import { useState } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import DoughnutChart from '../doughnut-chart';

import './style.scss';

export default function ECommerceTrialPlans( props ) {
	const {
		translate,
		moment,
		currentPlan,
		eCommerceTrialDaysLeft,
		eCommerceTrialExpiration,
		isTrialExpired,
		locale,
	} = props;

	const trialStart = moment( currentPlan?.subscribedDate );
	const trialEnd = moment( currentPlan?.expiryDate );
	const trialDuration = trialEnd.diff( trialStart, 'days' );

	// Trial progress from 0 to 1
	const trialProgress = 1 - eCommerceTrialDaysLeft / trialDuration;

	// moment.js doesn't have a format option to display the long form in a localized way without the year
	// https://github.com/moment/moment/issues/3341
	const readableExpirationDate = eCommerceTrialExpiration?.toDate().toLocaleDateString( locale, {
		month: 'long',
		day: 'numeric',
	} );

	const [ interval, setInterval ] = useState( 'yearly' );

	const segmentClasses = classNames( 'price-toggle' );

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-trial-plan' ] } />

			<Card className="e-commerce-trial-plans__trial-card">
				<div className="e-commerce-trial-plans__trial-card-content">
					<p className="e-commerce-trial-plans__card-title">
						{ translate( 'You’re in a free trial store' ) }
					</p>
					<p className="e-commerce-trial-plans__card-subtitle">
						{
							// Still need to populate the date correctly
							translate(
								'Your free trial will end in %(daysLeft)d day. Sign up to a plan by %(expirationdate)s to unlock new features and keep your store running.',
								'Your free trial will end in %(daysLeft)d days. Sign up to a plan by %(expirationdate)s to unlock new features and keep your store running.',
								{
									count: eCommerceTrialDaysLeft,
									args: {
										daysLeft: eCommerceTrialDaysLeft,
										expirationdate: readableExpirationDate,
									},
								}
							)
						}
					</p>
				</div>
				<div className="e-commerce-trial-plans__chart-wrapper">
					<DoughnutChart progress={ trialProgress } text={ eCommerceTrialDaysLeft } />
					<br />
					<span className="e-commerce-trial-plans__chart-label">
						{ isTrialExpired
							? translate( 'Your free trial has expired' )
							: translate( 'day left in trial', 'days left in trial', {
									count: eCommerceTrialDaysLeft,
							  } ) }
					</span>
				</div>
			</Card>

			<div className="e-commerce-trial-plans__interval-toggle-wrapper">
				<SegmentedControl compact primary={ true } className={ segmentClasses }>
					<SegmentedControl.Item
						selected={ interval === 'monthly' }
						onClick={ () => setInterval( 'monthly' ) }
					>
						<span>{ translate( 'Pay Monthly' ) }</span>
					</SegmentedControl.Item>

					<SegmentedControl.Item
						selected={ interval === 'yearly' }
						onClick={ () => setInterval( 'yearly' ) }
					>
						<span>{ translate( 'Pay Annually' ) }</span>
					</SegmentedControl.Item>
				</SegmentedControl>
			</div>

			<Card className="e-commerce-trial-plans__price-card">
				<div className="e-commerce-trial-plans__price-card-text">
					<span className="e-commerce-trial-plans__price-card-title">
						{ translate( 'Commerce' ) }
					</span>
					<span className="e-commerce-trial-plans__price-card-subtitle">
						{ translate( 'Accelerate your growth with advanced features.' ) }
					</span>
					<Button className="e-commerce-trial-plans__price-card-cta" primary>
						{ translate( 'Get Commerce' ) }
					</Button>
				</div>
				<div className="e-commerce-trial-plans__price-card-conditions">
					<span className="e-commerce-trial-plans__price-card-value">$45</span>
					<span className="e-commerce-trial-plans__price-card-interval">
						per month, $540 billed annually
					</span>
					<span className="e-commerce-trial-plans__price-card-savings">
						{ translate( 'SAVE 31% BY PAYING ANNUALLY' ) }
					</span>
				</div>
			</Card>
		</>
	);
}
