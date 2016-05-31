/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanHeaderRedesign from './plan-header';
import PlanFeatureListRedesign from './plan-feature-list';
import PlanFooterRedesign from './plan-footer';

const PlanRedesign = React.createClass( {

	render() {
		const { popular, current, features, description } = this.props;

		return (
			<div className={ classNames( 'plan--redesign', { 'is-popular': popular } ) }>
				<PlanHeaderRedesign { ...this.props } />
				<PlanFeatureListRedesign features={ features } />
				<PlanFooterRedesign current={ current } description={ description } />
			</div>
		);
	}

} );

export default PlanRedesign;
