/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_JETPACK_FREE, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_PERSONAL, getPlanClass } from 'lib/plans/constants';

export default class PlanIcon extends Component {
	getIcon( planName ) {
		const { plan, className } = this.props;
		const planClass = getPlanClass( plan );

		return (
			<img
				src={ `/calypso/images/plans/plan-${ planName }-circle.svg` }
				className={ classNames( 'plan-icon', `plan-icon__${ planName }`, planClass, className ) }
			/>
		);
	}

	render() {
		const { plan } = this.props;
		switch ( plan ) {
			case PLAN_PERSONAL:
			case PLAN_JETPACK_PERSONAL:
			case PLAN_JETPACK_PERSONAL_MONTHLY:
				return this.getIcon( 'personal' );
			case PLAN_PREMIUM:
			case PLAN_JETPACK_PREMIUM:
			case PLAN_JETPACK_PREMIUM_MONTHLY:
				return this.getIcon( 'premium' );
			case PLAN_BUSINESS:
			case PLAN_JETPACK_BUSINESS:
			case PLAN_JETPACK_BUSINESS_MONTHLY:
				return this.getIcon( 'business' );
			default:
				return this.getIcon( 'free' );
		}
	}
}

PlanIcon.propTypes = {
	classNames: PropTypes.string,
	plan: PropTypes.oneOf( [
		PLAN_FREE,
		PLAN_PREMIUM,
		PLAN_BUSINESS,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PERSONAL
	] ).isRequired
};
