/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import EmailForwardingPlaceholder from './email-forwarding-placeholder';
import Header from 'my-sites/domains/domain-management/components/header';
import EmailForwardingList from './email-forwarding-list';
import EmailForwardingAddNew from './email-forwarding-add-new';
import EmailForwardingDetails from './email-forwarding-details';
import EmailForwardingCustomMxList from './email-forwarding-custom-mx-list';
import EmailForwardingGSuiteDetails from './email-forwarding-gsuite-details';
import EmailForwardingGSuiteDetailsAnotherProvider from './email-forwarding-gsuite-details-another-provider';
import { domainManagementEmail } from 'my-sites/domains/paths';
import Card from 'components/card/compact';
import getEmailForwardingLimit from 'state/selectors/get-email-forwarding-limit';
import getEmailForwardingType from 'state/selectors/get-email-forwarding-type';
import getEmailForwards from 'state/selectors/get-email-forwards';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryEmailForwards from 'components/data/query-email-forwards';
import SectionHeader from 'components/section-header';

/**
 * Style dependencies
 */
import './style.scss';

class EmailForwarding extends Component {
	static propTypes = {
		emailForwards: PropTypes.array,
		emailForwardingLimit: PropTypes.number.isRequired,
		emailForwardingType: PropTypes.string,
		selectedDomainName: PropTypes.string.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { selectedDomainName, translate } = this.props;
		return (
			<Main>
				<QueryEmailForwards domainName={ selectedDomainName } />
				<Header onClick={ this.goToEditEmail } selectedDomainName={ selectedDomainName }>
					{ translate( 'Email Forwarding' ) }
				</Header>
				<SectionHeader label={ translate( 'Email Forwarding' ) } />
				{ this.renderContent() }
			</Main>
		);
	}

	renderContent() {
		const { emailForwardingType, selectedDomainName, siteSlug } = this.props;
		switch ( emailForwardingType ) {
			case 'forward':
				return this.renderForwards();

			case 'custom':
				return (
					<EmailForwardingCustomMxList
						selectedDomainName={ selectedDomainName }
						siteSlug={ siteSlug }
					/>
				);

			case 'google-apps':
				return (
					<EmailForwardingGSuiteDetails
						selectedDomainName={ selectedDomainName }
						siteSlug={ siteSlug }
					/>
				);

			case 'google-apps-another-provider':
				return <EmailForwardingGSuiteDetailsAnotherProvider />;

			default:
				return <EmailForwardingPlaceholder />;
		}
	}

	renderForwards() {
		const { emailForwards, emailForwardingLimit, selectedDomainName } = this.props;
		return (
			<Card className="email-forwarding__card">
				<EmailForwardingDetails selectedDomainName={ selectedDomainName } />

				<EmailForwardingList emailForwards={ emailForwards } />

				<EmailForwardingAddNew
					emailForwards={ emailForwards }
					emailForwardingLimit={ emailForwardingLimit }
					selectedDomainName={ selectedDomainName }
				/>
			</Card>
		);
	}

	goToEditEmail = () => {
		page( domainManagementEmail( this.props.siteSlug, this.props.selectedDomainName ) );
	};
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const { selectedDomainName } = ownProps;
	return {
		emailForwards: getEmailForwards( state, selectedDomainName ),
		emailForwardingLimit: getEmailForwardingLimit( state, siteId ),
		emailForwardingType: getEmailForwardingType( state, selectedDomainName ),
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( EmailForwarding ) );
