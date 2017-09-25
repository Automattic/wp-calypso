/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';

import DocumentHead from 'components/data/document-head';

const DomainManagementHeader = React.createClass( {
	render() {
		return (
			<HeaderCake className="domain-management-header" onClick={ this.props.onClick } backHref={ this.props.backHref }>
				<div className="domain-management-header__children">
					{ this.domainName() }
					<span className="domain-management-header__title">
						{ this.props.children }
					</span>
				</div>
				<DocumentHead title={ this.props.children } />
			</HeaderCake>
		);
	},

	domainName() {
		if ( ! this.props.selectedDomainName ) {
			return null;
		}

		return <span>{ this.props.selectedDomainName }: </span>;
	}
} );

export default DomainManagementHeader;
