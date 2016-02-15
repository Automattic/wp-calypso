/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import MainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/upgrades/domain-management/components/header';
import EmailForwardingList from './email-forwarding-list';
import EmailForwardingAddNew from './email-forwarding-add-new';
import EmailForwardingDetails from './email-forwarding-details';
import paths from 'my-sites/upgrades/paths';
import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';
import { isBusiness } from 'lib/products-values';

const EmailForwarding = React.createClass( {
	propTypes: {
		emailForwarding: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	maxForwards() {
		if ( isBusiness( this.props.selectedSite.plan ) ) {
			return 500;
		}

		return 5;
	},

	render() {
		if ( this.isDataLoading() ) {
			return <MainPlaceholder goBack={ this.goToEditEmail } />;
		}
		return (
			<Main className="email-forwarding">
				<Header
					onClick={ this.goToEditEmail }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Email Forwarding' ) }
				</Header>

				<SectionHeader label={ this.translate( 'Email Forwarding' ) } />
				<Card className="email-forwarding-card">
					<EmailForwardingDetails
						selectedDomainName={ this.props.selectedDomainName } />

					<EmailForwardingList
						selectedSite={ this.props.selectedSite }
						emailForwarding={ this.props.emailForwarding } />

					<EmailForwardingAddNew
						emailForwarding={ this.props.emailForwarding }
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite }
						maxForwards={ this.maxForwards() } />
				</Card>
			</Main>
		);
	},

	isDataLoading() {
		return ( ! this.props.emailForwarding.hasLoadedFromServer );
	},

	goToEditEmail() {
		page( paths.domainManagementEmail( this.props.selectedSite.domain, this.props.selectedDomainName ) );
	}
} );

export default EmailForwarding;
