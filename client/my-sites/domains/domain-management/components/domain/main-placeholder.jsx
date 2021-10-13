import { CompactCard } from '@automattic/components';
import { Component } from 'react';
import Main from 'calypso/components/main';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import Header from 'calypso/my-sites/domains/domain-management/components/header';

import './main-placeholder.scss';

class DomainMainPlaceholder extends Component {
	render() {
		return (
			<Main className="domain__main-placeholder">
				<Header onClick={ this.props.goBack } backHref={ this.props.backHref } />
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
