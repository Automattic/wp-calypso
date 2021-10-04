import { CompactCard } from '@automattic/components';
import { Component } from 'react';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import PrimaryHeader from '../shared/primary-header';

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
