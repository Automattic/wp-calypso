/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL
} from 'lib/plans/constants';

export default class PlanIcon extends Component {
	render() {
		const { plan, className } = this.props;
		const planClass = this.getPlanClass( plan );
		const classes = classNames( 'plan-icon', planClass, className );

		return (
			<div className={ classes } />
		);
	}

	getPlanClass( plan ) {
		switch ( plan ) {
			case PLAN_JETPACK_FREE:
			case PLAN_FREE:
				return 'is-free-plan';
			case PLAN_PERSONAL:
				return 'is-personal-plan';
			case PLAN_PREMIUM:
			case PLAN_JETPACK_PREMIUM:
			case PLAN_JETPACK_PREMIUM_MONTHLY:
				return 'is-premium-plan';
			case PLAN_BUSINESS:
			case PLAN_JETPACK_BUSINESS:
			case PLAN_JETPACK_BUSINESS_MONTHLY:
				return 'is-business-plan';
			default:
				return '';
		}
	}
}

PlanIcon.propTypes = {
	classNames: React.PropTypes.string,
	plan: React.PropTypes.oneOf( [
		PLAN_FREE,
		PLAN_PREMIUM,
		PLAN_BUSINESS,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_PERSONAL
	] ).isRequired
};
