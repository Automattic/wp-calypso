/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import EnableDomainLockingNotice from './enable-domain-locking-notice';
import EnablePrivacyNotice from './enable-privacy-notice';
import Header from 'my-sites/upgrades/domain-management/components/header';
import IcannVerificationNotice from './icann-verification-notice';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import PendingTransferNotice from './pending-transfer-notice';
import RequestTransferCode from './request-transfer-code';
import TransferProhibitedNotice from './transfer-prohibited-notice';

const Transfer = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		wapiDomainInfo: React.PropTypes.object.isRequired
	},

	render() {
		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		return (
			<Main className="domain-management-transfer">
				{ this.renderHeader() }

				<Card className="transfer-card">
					<IcannVerificationNotice
						domains={ this.props.domains }
						selectedDomainName={ this.props.selectedDomainName } />

					<TransferProhibitedNotice
						domains={ this.props.domains }
						selectedDomainName={ this.props.selectedDomainName } />

					<EnableDomainLockingNotice
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite }
						wapiDomainInfo={ this.props.wapiDomainInfo } />

					<EnablePrivacyNotice
						domains={ this.props.domains }
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite } />

					<PendingTransferNotice
						domains={ this.props.domains }
						selectedDomainName={ this.props.selectedDomainName }
						wapiDomainInfo={ this.props.wapiDomainInfo } />

					<RequestTransferCode
						domains={ this.props.domains }
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite }
						wapiDomainInfo={ this.props.wapiDomainInfo } />
				</Card>
			</Main>
		);
	},

	goToEdit() {
		page( paths.domainManagementEdit(
			this.props.selectedSite.domain,
			this.props.selectedDomainName
		) );
	},

	isDataLoading() {
		return (
			! this.props.wapiDomainInfo.hasLoadedFromServer ||
			! this.props.domains.hasLoadedFromServer
		);
	},

	renderHeader() {
		return (
			<Header
					onClick={ this.goToEdit }
					selectedDomainName={ this.props.selectedDomainName }>
				{ this.translate( 'Transfer Domain' ) }
			</Header>
		);
	}
} );

export default Transfer;
