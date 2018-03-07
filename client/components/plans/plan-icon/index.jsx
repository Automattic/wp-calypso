/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { isBusinessPlan, isPersonalPlan, isPremiumPlan } from '../../../lib/plans';
import { getPlanClass, PLANS_CONSTANTS_LIST } from '../../../lib/plans/constants';

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
		switch ( true ) {
			case isPersonalPlan( plan ):
				return this.getIcon( 'personal' );

			case isPremiumPlan( plan ):
				return this.getIcon( 'premium' );

			case isBusinessPlan( plan ):
				return this.getIcon( 'business' );
			default:
				return this.getIcon( 'free' );
		}
	}
}

PlanIcon.propTypes = {
	classNames: PropTypes.string,
	plan: PropTypes.oneOf( PLANS_CONSTANTS_LIST ).isRequired,
};
