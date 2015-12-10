/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';

const PlanFeatures = React.createClass( {
	render() {
		return (
			<div>
				<SectionHeader label={ this.translate( "Your Site's Features" ) } />
				<Card>
					...
				</Card>
			</div>
		);
	}
} );

export default PlanFeatures;
