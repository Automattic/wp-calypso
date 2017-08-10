/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Header from 'my-sites/domains/domain-management/components/header';
import Main from 'components/main';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';

const DomainMainPlaceholder = React.createClass( {
	render() {
		return (
			<Main className="domain-main-placeholder">
				<Header onClick={ this.props.goBack } />

				<VerticalNav>
					<CompactCard className="domain-main-placeholder__card">
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
	},
} );

export default DomainMainPlaceholder;
