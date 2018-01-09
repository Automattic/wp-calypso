/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PrimaryHeader from '../shared/primary-header';
import SitePlaceholder from 'blocks/site/placeholder';

class Skeleton extends Component {
	render() {
		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="book__site-block">
					<SitePlaceholder />
				</CompactCard>
			</div>
		);
	}
}

export default Skeleton;
