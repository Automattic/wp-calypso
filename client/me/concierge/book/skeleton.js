/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import PrimaryHeader from '../shared/primary-header';
import SitePlaceholder from 'calypso/blocks/site/placeholder';

class Skeleton extends Component {
	render() {
		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="book__skeleton-site-block">
					<SitePlaceholder />
				</CompactCard>
			</div>
		);
	}
}

export default Skeleton;
