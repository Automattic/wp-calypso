/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
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
import { emailManagement } from 'my-sites/email/paths';
import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';

class EmailForwarding extends React.Component {
	static propTypes = {
		emailForwarding: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	render() {
		if ( this.isDataLoading() ) {
			return <MainPlaceholder goBack={ this.goToEditEmail } />;
		}
		return (
			<Main className="email-forwarding">
				<Header onClick={ this.goToEditEmail } selectedDomainName={ this.props.selectedDomainName }>
					{ this.props.translate( 'Email Forwarding' ) }
				</Header>

				<SectionHeader label={ this.props.translate( 'Email Forwarding' ) } />
				<Card className="email-forwarding-card">
					<EmailForwardingDetails selectedDomainName={ this.props.selectedDomainName } />

					<EmailForwardingList
						selectedSite={ this.props.selectedSite }
						emailForwarding={ this.props.emailForwarding }
					/>

					<EmailForwardingAddNew
						emailForwarding={ this.props.emailForwarding }
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite }
					/>
				</Card>
			</Main>
		);
	}

	isDataLoading = () => {
		return ! this.props.emailForwarding.hasLoadedFromServer;
	};

	goToEditEmail = () => {
		page( emailManagement( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};
}

export default localize( EmailForwarding );
