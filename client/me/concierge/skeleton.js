/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'client/components/card/compact';
import PrimaryHeader from './primary-header';
import SitePlaceholder from 'client/blocks/site/placeholder';

class Skeleton extends Component {
	render() {
		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="concierge__site-block">
					<SitePlaceholder />
				</CompactCard>
			</div>
		);
	}
}

export default Skeleton;
