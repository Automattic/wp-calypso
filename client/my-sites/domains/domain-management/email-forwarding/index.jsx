/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import MainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/domains/domain-management/components/header';
import EmailForwardingList from './email-forwarding-list';
import EmailForwardingAddNew from './email-forwarding-add-new';
import EmailForwardingDetails from './email-forwarding-details';
import paths from 'my-sites/domains/paths';
import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';

const EmailForwarding = React.createClass( {
	propTypes: {
		emailForwarding: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired
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
						selectedSite={ this.props.selectedSite } />
				</Card>
			</Main>
		);
	},

	isDataLoading() {
		return ( ! this.props.emailForwarding.hasLoadedFromServer );
	},

	goToEditEmail() {
		page( paths.domainManagementEmail( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	}
} );

export default EmailForwarding;
