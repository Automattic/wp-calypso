/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
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
import { domainManagementEmail } from 'my-sites/domains/paths';
import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';
import getEmailForwardingLimit from 'state/selectors/get-email-forwarding-limit';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class EmailForwarding extends React.Component {
	static propTypes = {
		emailForwarding: PropTypes.object.isRequired,
		emailForwardingLimit: PropTypes.number.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { emailForwarding, emailForwardingLimit, selectedDomainName, translate } = this.props;
		if ( this.isDataLoading() ) {
			return <MainPlaceholder goBack={ this.goToEditEmail } />;
		}
		return (
			<Main className="email-forwarding">
				<Header onClick={ this.goToEditEmail } selectedDomainName={ selectedDomainName }>
					{ translate( 'Email Forwarding' ) }
				</Header>

				<SectionHeader label={ translate( 'Email Forwarding' ) } />
				<Card className="email-forwarding__card">
					<EmailForwardingDetails selectedDomainName={ selectedDomainName } />

					<EmailForwardingList emailForwarding={ emailForwarding } />

					<EmailForwardingAddNew
						emailForwarding={ emailForwarding }
						emailForwardingLimit={ emailForwardingLimit }
						selectedDomainName={ selectedDomainName }
					/>
				</Card>
			</Main>
		);
	}

	isDataLoading = () => {
		return ! this.props.emailForwarding.hasLoadedFromServer;
	};

	goToEditEmail = () => {
		page( domainManagementEmail( this.props.siteSlug, this.props.selectedDomainName ) );
	};
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			emailForwardingLimit: getEmailForwardingLimit( state, siteId ),
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
	null
)( localize( EmailForwarding ) );
