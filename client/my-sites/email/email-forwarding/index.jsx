import { CompactCard as Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import Main from 'calypso/components/main';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import EmailForwardingAddNew from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new';
import EmailForwardingCustomMxList from 'calypso/my-sites/email/email-forwarding/email-forwarding-custom-mx-list';
import EmailForwardingDetails from 'calypso/my-sites/email/email-forwarding/email-forwarding-details';
import EmailForwardingGSuiteDetails from 'calypso/my-sites/email/email-forwarding/email-forwarding-gsuite-details';
import EmailForwardingGSuiteDetailsAnotherProvider from 'calypso/my-sites/email/email-forwarding/email-forwarding-gsuite-details-another-provider';
import EmailForwardingList from 'calypso/my-sites/email/email-forwarding/email-forwarding-list';
import { emailManagement } from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getEmailForwardingLimit from 'calypso/state/selectors/get-email-forwarding-limit';
import getEmailForwardingType from 'calypso/state/selectors/get-email-forwarding-type';
import { getEmailForwards } from 'calypso/state/selectors/get-email-forwards';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import EmailForwardingPlaceholder from './email-forwarding-placeholder';

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
		page(
			emailManagement( this.props.siteSlug, this.props.selectedDomainName, this.props.currentRoute )
		);
	};
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const { selectedDomainName } = ownProps;
	return {
		currentRoute: getCurrentRoute( state ),
		emailForwards: getEmailForwards( state, selectedDomainName ),
		emailForwardingLimit: getEmailForwardingLimit( state, siteId ),
		emailForwardingType: getEmailForwardingType( state, selectedDomainName ),
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( EmailForwarding ) );
