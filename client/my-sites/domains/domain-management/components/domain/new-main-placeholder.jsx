import { CompactCard } from '@automattic/components';
import { Component } from 'react';
import Main from 'calypso/components/main';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

import './main-placeholder.scss';

class DomainMainPlaceholder extends Component {
	render() {
		const { breadcrumbs: BreadcrumbsElement } = this.props;
		return (
			<Main wideLayout className="domain__main-placeholder">
				{ BreadcrumbsElement && <BreadcrumbsElement /> }
				<VerticalNav>
					<CompactCard className="domain__main-placeholder-card">
						<p />
						<p />
						<p />
						<p />
					</CompactCard>
					<VerticalNavItem isPlaceholder />
					<VerticalNavItem isPlaceholder />
				</VerticalNav>
			</Main>
		);
	}
}

export default DomainMainPlaceholder;
