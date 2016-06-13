/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanFeaturesHeader from './header';
import PlanFeaturesItemList from './list';
import PlanFeaturesItem from './item';
import PlanFeaturesFooter from './footer';

class PlanFeatures extends Component {
	render() {
		const { popular, current, features, description } = this.props;

		const classes = classNames( 'plan-features', {
			'is-popular': popular
		} );

		return (
			<div className={ classes } >
				<PlanFeaturesHeader { ...this.props } />
				<PlanFeaturesItemList>
					{
						features.map( ( feature ) =>
							<PlanFeaturesItem>{ feature.title }</PlanFeaturesItem>
						)
					}
				</PlanFeaturesItemList>
				<PlanFeaturesFooter current={ current } description={ description } />
			</div>
		);
	}
}

PlanFeatures.propTypes = {
	current: PropTypes.bool,
	popular: PropTypes.bool,
	features: PropTypes.array.isRequired,
	description: PropTypes.string.isRequired
};

PlanFeaturesHeader.defaultProps = {
	current: false,
	popular: false
};
