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
	PLAN_PERSONAL,
	getPlanClass
} from 'lib/plans/constants';

export default class PlanIcon extends Component {
	render() {
		const { plan, className } = this.props;
		const planClass = getPlanClass( plan );
		const classes = classNames( 'plan-icon', planClass, className );

		return (
			<div className={ classes } />
		);
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
