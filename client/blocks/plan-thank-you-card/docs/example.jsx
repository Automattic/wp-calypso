/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import sitesList from 'lib/sites-list';
import PlanThankYouCard from 'blocks/plan-thank-you-card';

const sites = sitesList();

const PlanThankYouCardExample = React.createClass( {
	displayName: 'PlanThankYouCard',
	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/plan-thank-you-card">Plan Thank You Card</a>
				</h2>
				<PlanThankYouCard selectedSite={ sites.getPrimary() } />
			</div>
		);
	}
} );

module.exports = PlanThankYouCardExample;
