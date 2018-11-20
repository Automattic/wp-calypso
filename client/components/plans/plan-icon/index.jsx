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
import { PLANS_LIST, getPlanClass } from 'lib/plans/constants';
import {
	isBloggerPlan,
	isPersonalPlan,
	isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
} from 'lib/plans';

export default class PlanIcon extends Component {
	getIcon( planName ) {
		const { plan, className } = this.props;
		const planClass = getPlanClass( plan );

		/* eslint-disable jsx-a11y/alt-text */
		return (
			<img
				src={ `/calypso/images/plans/plan-${ planName }-circle.svg` }
				className={ classNames( 'plan-icon', `plan-icon__${ planName }`, planClass, className ) }
			/>
		);
		/* eslint-enable jsx-a11y/alt-text */
	}

	render() {
		const { plan } = this.props;
		if ( isBloggerPlan( plan ) ) {
			return this.getIcon( 'blogger' );
		}

		if ( isPersonalPlan( plan ) ) {
			return this.getIcon( 'personal' );
		}

		if ( isPremiumPlan( plan ) ) {
			return this.getIcon( 'premium' );
		}

		if ( isBusinessPlan( plan ) ) {
			return this.getIcon( 'business' );
		}

		if ( isEcommercePlan( plan ) ) {
			return this.getIcon( 'ecommerce' );
		}

		return this.getIcon( 'free' );
	}
}

PlanIcon.propTypes = {
	classNames: PropTypes.string,
	plan: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
};
