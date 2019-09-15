/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { GROUP_JETPACK } from 'lib/plans/constants';
import { PLANS_LIST } from 'lib/plans/plans-list';
import {
	planMatches,
	isBloggerPlan,
	isPersonalPlan,
	isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
	getPlanClass,
} from 'lib/plans';

/**
 * Style dependencies
 */
import './style.scss';

export default class PlanIcon extends Component {
	getIcon( planName ) {
		const { plan, className } = this.props;
		const planClass = getPlanClass( plan );
		const isJetpack = planMatches( plan, { group: GROUP_JETPACK } );

		/* eslint-disable jsx-a11y/alt-text */
		return (
			<img
				src={ `/calypso/images/plans/${ isJetpack ? 'jetpack' : 'wpcom' }/plan-${ planName }.svg` }
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
