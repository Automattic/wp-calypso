/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

/**
 * Style dependencies
 */
import './main-placeholder.scss';

class DomainMainPlaceholder extends React.Component {
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
