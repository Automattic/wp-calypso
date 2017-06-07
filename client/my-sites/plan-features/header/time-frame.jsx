/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { isMobile } from 'lib/viewport';
import { plansLink } from 'lib/plans';
import { PLAN_JETPACK_FREE } from 'lib/plans/constants';
import InfoPopover from 'components/info-popover';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export class PlanFeaturesHeaderTimeFrame extends Component {
	render() {
		const {
			billingTimeFrame,
			discountPrice,
			isPlaceholder,
			site,
			translate,
			planType,
			isSiteAT,
			hideMonthly
		} = this.props;

		const isDiscounted = !! discountPrice;
		const timeframeClasses = classNames( 'plan-features__header-timeframe', {
			'is-discounted': isDiscounted,
			'is-placeholder': isPlaceholder
		} );

		if (
			hideMonthly ||
			isSiteAT ||
			! site.jetpack ||
			planType === PLAN_JETPACK_FREE
		) {
			return (
				<p className={ timeframeClasses }>
					{ ! isPlaceholder ? billingTimeFrame : '' }
					{ isDiscounted && ! isPlaceholder &&
						<InfoPopover
							className="plan-features__header-tip-info"
							position={ isMobile() ? 'top' : 'bottom left' }>
							{ translate( 'Discount for first year' ) }
						</InfoPopover>
					}
				</p>
			);
		}

		return this.getIntervalTypeToggle();
	}

	getIntervalTypeToggle() {
		const {
			translate,
			rawPrice,
			intervalType,
			site,
			basePlansPath,
			hideMonthly,
			isPlanCurrent,
		} = this.props;

		if ( hideMonthly ||
			! rawPrice ||
			isPlanCurrent ) {
			return <div className="plan-features__interval-type is-placeholder" />;
		}

		let plansUrl = '/plans';
		if ( basePlansPath ) {
			plansUrl = basePlansPath;
		}

		return (
			<SegmentedControl compact className="plan-features__interval-type" primary={ true }>
				<SegmentedControlItem
					selected={ intervalType === 'monthly' }
					path={ plansLink( plansUrl, site, 'monthly' ) }
				>
					{ translate( 'Monthly' ) }
				</SegmentedControlItem>

				<SegmentedControlItem
					selected={ intervalType === 'yearly' }
					path={ plansLink( plansUrl, site, 'yearly' ) }
				>
					{ translate( 'Yearly' ) }
				</SegmentedControlItem>
			</SegmentedControl>
		);
	}
}
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default localize( PlanFeaturesHeaderTimeFrame );
