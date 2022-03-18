import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	hasUnusedMailboxWarning,
	hasGoogleAccountTOSWarning,
	isTitanMailAccount,
} from 'calypso/lib/emails';
import { getGoogleAdminWithTosUrl } from 'calypso/lib/gsuite';
import { isTitanSubscriptionSuspended } from 'calypso/lib/titan/is-titan-subscription-suspended';
import { emailManagement, emailManagementTitanSetUpMailbox } from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

class EmailPlanWarnings extends Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		emailAccount: PropTypes.object.isRequired,
	};

	renderCTAForTitanUnusedMailboxes() {
		const { currentRoute, domain, selectedSiteSlug, translate } = this.props;

		const setUpMailboxUrl = emailManagementTitanSetUpMailbox(
			selectedSiteSlug,
			domain.name,
			currentRoute
		);

		return (
			<Button compact primary href={ setUpMailboxUrl }>
				{ translate( 'Set up mailbox' ) }
			</Button>
		);
	}

	renderCTAForTitanSuspendedAccount() {
		const { domain, selectedSiteSlug, translate } = this.props;

		return (
			<Button compact primary href={ emailManagement( selectedSiteSlug, domain.name ) }>
				{ translate( 'Manage email' ) }
			</Button>
		);
	}

	renderCTAForGooglePendingTOSAcceptance() {
		const { domain, translate } = this.props;

		return (
			<Button compact primary href={ getGoogleAdminWithTosUrl( domain.name ) } target="_blank">
				{ translate( 'Finish setup' ) }
				<Gridicon icon="external" />
			</Button>
		);
	}

	renderCTA() {
		const { domain, emailAccount } = this.props;

		if ( hasUnusedMailboxWarning( emailAccount ) && isTitanMailAccount( emailAccount ) ) {
			return this.renderCTAForTitanUnusedMailboxes();
		}

		if ( hasGoogleAccountTOSWarning( emailAccount ) ) {
			return this.renderCTAForGooglePendingTOSAcceptance();
		}

		if ( isTitanSubscriptionSuspended( domain ) ) {
			return this.renderCTAForTitanSuspendedAccount();
		}

		return null;
	}

	render() {
		const { warning } = this.props;
		if ( ! warning ) {
			return null;
		}

		return (
			<div className="email-plan-warnings__container">
				<div className="email-plan-warnings__warning">
					<div className="email-plan-warnings__message">
						<span>{ warning.message }</span>
					</div>
					<div className="email-plan-warnings__cta">{ this.renderCTA() }</div>
				</div>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
		// To optimize the real estate and user experience we should just pluck the first warning.
		warning: ownProps.emailAccount?.warnings?.[ 0 ],
	};
} )( localize( EmailPlanWarnings ) );
