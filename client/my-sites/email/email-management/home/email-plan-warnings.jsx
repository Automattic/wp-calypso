/**
 * External dependencies
 */
import { Button } from '@automattic/components';
import { connect } from 'react-redux';
import { isEnabled } from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import {
	emailManagementManageTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import { getConfiguredTitanMailboxCount, getMaxTitanMailboxCount } from 'calypso/lib/titan';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getGoogleAdminUrl } from 'calypso/lib/gsuite';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Gridicon from 'calypso/components/gridicon';
import {
	hasUnusedMailboxWarning,
	hasGoogleAccountTOSWarning,
	isTitanMailAccount,
} from 'calypso/lib/emails';
import { TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL } from 'calypso/lib/titan/constants';

class EmailPlanWarnings extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		emailAccount: PropTypes.object.isRequired,
	};

	renderCTAForTitanUnusedMailboxes() {
		const { currentRoute, domain, selectedSiteSlug, translate } = this.props;

		const showExternalControlPanelLink = ! isEnabled( 'titan/iframe-control-panel' );
		const controlPanelUrl = showExternalControlPanelLink
			? emailManagementTitanControlPanelRedirect( selectedSiteSlug, domain.name, currentRoute, {
					context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
			  } )
			: emailManagementManageTitanAccount( selectedSiteSlug, domain.name, currentRoute, {
					context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
			  } );

		return (
			<Button
				compact
				primary
				href={ controlPanelUrl }
				target={ showExternalControlPanelLink ? '_blank' : null }
			>
				{ translate( 'Activate Mailbox', 'Activate Mailboxes', {
					count: getMaxTitanMailboxCount( domain ) - getConfiguredTitanMailboxCount( domain ),
				} ) }
				{ showExternalControlPanelLink && <Gridicon icon="external" /> }
			</Button>
		);
	}

	renderCTAForGooglePendingTOSAcceptance() {
		const { domain, translate } = this.props;

		return (
			// TODO: Change to `getGoogleAdminWithTosUrl()` function flagged in https://github.com/Automattic/wp-calypso/pull/53032#pullrequestreview-664396027
			<Button compact primary href={ getGoogleAdminUrl( domain.name ) } target="_blank">
				{ translate( 'Finish Setup' ) }
				<Gridicon icon="external" />
			</Button>
		);
	}

	renderCTA() {
		const { emailAccount } = this.props;

		if ( hasUnusedMailboxWarning( emailAccount ) && isTitanMailAccount( emailAccount ) ) {
			return this.renderCTAForTitanUnusedMailboxes();
		}

		if ( hasGoogleAccountTOSWarning( emailAccount ) ) {
			return this.renderCTAForGooglePendingTOSAcceptance();
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
