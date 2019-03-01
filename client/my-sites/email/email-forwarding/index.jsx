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
import MainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/domains/domain-management/components/header';
import EmailForwardingList from './email-forwarding-list';
import EmailForwardingAddNew from './email-forwarding-add-new';
import EmailForwardingDetails from './email-forwarding-details';
import { domainManagementEmail } from 'my-sites/domains/paths';
import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';
import getEmailForwardingLimit from 'state/selectors/get-email-forwarding-limit';
import getEmailForwards from 'state/selectors/get-email-forwards';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryEmailForwards from 'components/data/query-email-forwards';

/**
 * Style dependencies
 */
import './style.scss';

class EmailForwarding extends Component {
	static propTypes = {
		emailForwards: PropTypes.array,
		emailForwardingLimit: PropTypes.number.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { emailForwards, selectedDomainName } = this.props;
		return (
			<div className="email-forwarding">
				<QueryEmailForwards domainName={ selectedDomainName } />
				{ emailForwards ? this.renderMain() : this.renderPlaceholder() }
			</div>
		);
	}

	renderPlaceholder() {
		return <MainPlaceholder goBack={ this.goToEditEmail } />;
	}

	renderMain() {
		const { emailForwards, emailForwardingLimit, selectedDomainName, translate } = this.props;
		return (
			<Main>
				<Header onClick={ this.goToEditEmail } selectedDomainName={ selectedDomainName }>
					{ translate( 'Email Forwarding' ) }
				</Header>

				<SectionHeader label={ translate( 'Email Forwarding' ) } />
				<Card className="email-forwarding__card">
					<EmailForwardingDetails selectedDomainName={ selectedDomainName } />

					<EmailForwardingList emailForwards={ emailForwards } />

					<EmailForwardingAddNew
						emailForwards={ emailForwards }
						emailForwardingLimit={ emailForwardingLimit }
						selectedDomainName={ selectedDomainName }
					/>
				</Card>
			</Main>
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
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( EmailForwarding ) );
