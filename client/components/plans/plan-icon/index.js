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
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	getPlanClass
} from 'lib/plans/constants';

export default class PlanIcon extends Component {
	getIconClassNames( iconClass = '' ) {
		const { plan, className } = this.props;
		const planClass = getPlanClass( plan );
		return classNames( 'plan-icon', planClass, className, iconClass );
	}

	/* eslint-disable max-len, react/jsx-space-before-closing */
	getPersonalIcon() {
		return (
			<svg className={ this.getIconClassNames( 'plan-icon__personal' ) } xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 124 125"><circle className="plan-icon__personal-0" cx="62" cy="62.1" r="62"/><path className="plan-icon__personal-1" d="M64 106.1l4-9.8v-3.5H62v14.6C62.9 107.4 63.6 106.9 64 106.1z"/><path className="plan-icon__personal-2" d="M56.2 92.8v3.5l4 9.8c0.3 0.8 1.1 1.3 1.9 1.3V92.8H56.2z"/><path className="plan-icon__personal-2" d="M62 32.9h17.1V2.5C73.7 0.9 68 0.1 62 0.1V32.9z"/><path className="plan-icon__personal-3" d="M62 32.9V0.1c0 0 0 0 0 0 -5.9 0-11.6 0.8-17 2.4v30.5H62z"/><polygon className="plan-icon__personal-4" points="62 32.9 45 32.9 48.3 48.7 53.3 92.8 62 92.8 "/><polygon className="plan-icon__personal-5" points="62 32.9 79.2 32.9 75.9 48.7 70.9 92.8 62 92.8 " /></svg>
		);
	}

	getPremiumIcon() {
		return (
			<svg className={ this.getIconClassNames( 'plan-icon__premium' ) } xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 62 61.5"><ellipse className="plan-icon__premium-0" cx="31" cy="30.8" rx="31" ry="30.8"/><path className="plan-icon__premium-1" d="M27.8 46.3v1.9l2.2 5.4c0.2 0.5 0.5 0.7 1 0.7v-7.9L27.8 46.3z"/><path className="plan-icon__premium-2" d="M32 53.6l2.2-5.4v-1.9H31v3.8 4.1C31.5 54.3 31.9 54 32 53.6z"/><path className="plan-icon__premium-3" d="M21.6 18c0.2 2 4.8 28.3 4.8 28.3l4.6 0.1V18H21.6z"/><path className="plan-icon__premium-4" d="M40.5 18H31v23.4 5l4.5-0.1C35.5 46.3 40.1 20.4 40.5 18z"/><path className="plan-icon__premium-5" d="M31 18V0c-3.9 0-7.7 0.7-11.2 2.1 0.7 6 1.8 15.9 1.8 15.9H31z"/><path className="plan-icon__premium-6" d="M31 18h9.5c0 0 1.1-9.9 1.8-15.9C38.8 0.7 35 0 31 0V18z" /></svg>
		);
	}

	getBusinessIcon() {
		return (
			<svg className={ this.getIconClassNames( 'plan-icon__business' ) } xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 124 124"><circle className="plan-icon__business-0" cx="62" cy="62" r="62"/><path className="plan-icon__business-1" d="M57.4 73.8c0-2.5 2-4.6 4.6-4.6V36.8h-9.6v12.1c-8 3.7-13.5 11.7-13.5 21.1 0 4.9 1.5 9.4 4.1 13.1l0 0c15.4 22.4 15.4 22.4 17 24.8h0.3V78.1C58.6 77.4 57.4 75.7 57.4 73.8L57.4 73.8z"/><path className="plan-icon__business-2" d="M85.2 69.8c0-9.4-5.6-17.4-13.5-21.1v-12H62v32.5c2.5 0 4.6 2 4.6 4.6 0 1.9-1.2 3.5-2.9 4.2v29.8H64c1.6-2.4 1.6-2.4 17-24.8l0 0C83.6 79.2 85.2 74.7 85.2 69.8L85.2 69.8z"/><path className="plan-icon__business-3" d="M48.6 32h-2.4c-3.2 0-5.8 2.6-5.8 5.8V38c0 3.2 2.6 5.8 5.8 5.8H62v-4.7V32 0c-7.2 0-14.1 1.2-20.6 3.5 1.1 5.5 2.5 11 4.1 16.5L48.6 32z"/><path className="plan-icon__business-4" d="M62 39.1v4.7h15.8c3.2 0 5.8-2.6 5.8-5.8v-0.2c0-3.2-2.6-5.8-5.8-5.8h-2.4l3.1-12c1.6-5.5 3-11 4.1-16.5C76.1 1.2 69.2 0 62 0v32V39.1z" /></svg>
		);
	}

	getDefaultIcon() {
		return (
			<svg className={ this.getIconClassNames( 'plan-icon__free' ) } xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 61.8 61.8"><circle className="plan-icon__free-0" cx="30.9" cy="30.9" r="30.9"/><polygon className="plan-icon__free-1" points="41.4 32.8 30.9 22.5 20.3 32.8 30.9 51.8 "/><path className="plan-icon__free-2" d="M30.9 41.6L30.9 41.6c-2 0-3.7 1.6-3.7 3.6l3.7 6.5 3.7-6.5C34.5 43.2 32.9 41.6 30.9 41.6L30.9 41.6z"/><path className="plan-icon__free-3" d="M25.6 27.7c0 2.9 2.3 5.2 5.2 5.2h0.1c2.9 0 5.2-2.3 5.2-5.2v-0.1V0.4c-1.7-0.3-3.5-0.5-5.3-0.5s-3.6 0.2-5.3 0.5v27.3H25.6z"/><path className="plan-icon__free-4" d="M25.6 27.6V0.4c-1.8 0.3-3.6 0.8-5.3 1.4v31C23.2 32.8 25.6 30.5 25.6 27.6z"/><path className="plan-icon__free-2" d="M41.4 32.8v-31c-1.7-0.6-3.5-1.1-5.3-1.4v27.2C36.1 30.5 38.5 32.8 41.4 32.8z" /></svg>
		);
	}
	/* eslint-enable max-len, react/jsx-space-before-closing */

	render() {
		const { plan } = this.props;
		switch ( plan ) {
			case PLAN_PERSONAL:
			case PLAN_JETPACK_PERSONAL:
			case PLAN_JETPACK_PERSONAL_MONTHLY:
				return this.getPersonalIcon();
			case PLAN_PREMIUM:
			case PLAN_JETPACK_PREMIUM:
			case PLAN_JETPACK_PREMIUM_MONTHLY:
				return this.getPremiumIcon();
			case PLAN_BUSINESS:
			case PLAN_JETPACK_BUSINESS:
			case PLAN_JETPACK_BUSINESS_MONTHLY:
				return this.getBusinessIcon();
			default:
				return this.getDefaultIcon();
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
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PERSONAL
	] ).isRequired
};
