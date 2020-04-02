/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DomainStatus from '../card/domain-status';
import DomainManagementNavigation from '../navigation';

class WpcomDomainType extends React.Component {
	render() {
		const {
			domain: { name: domain_name },
			domain,
		} = this.props;

		return (
			<div className="domain-types__container">
				<DomainStatus
					header={ domain_name }
					statusText={ this.props.translate( 'Active' ) }
					statusClass="status-success"
					icon="check_circle"
				/>
				<DomainManagementNavigation domain={ domain } selectedSite={ this.props.selectedSite } />
			</div>
		);
	}
}

export default localize( WpcomDomainType );
