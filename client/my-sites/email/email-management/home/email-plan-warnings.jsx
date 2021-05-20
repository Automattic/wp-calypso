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
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL,
	EMAIL_WARNING_SLUG_UNUSED_MAILBOXES,
} from 'calypso/lib/emails/email-provider-constants';
import {
	emailManagementManageTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Gridicon from 'calypso/components/gridicon';
import { TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL } from 'calypso/lib/titan/constants';

class EmailPlanWarnings extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		emailAccountType: PropTypes.string.isRequired,
		warnings: PropTypes.array,
	};

	renderWarningCTAForTitanUnusedMailboxes() {
		const { selectedSiteSlug, domain, currentRoute, translate } = this.props;

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
				{ translate( 'Activate Mailboxes' ) }
				{ showExternalControlPanelLink && <Gridicon icon="external" /> }
			</Button>
		);
	}

	renderWarningCTA( warning ) {
		const warningSlug = warning.warning_slug;
		if ( ! warningSlug ) {
			return null;
		}

		if ( EMAIL_WARNING_SLUG_UNUSED_MAILBOXES === warningSlug ) {
			if ( EMAIL_ACCOUNT_TYPE_TITAN_MAIL === this.props.emailAccountType ) {
				return this.renderWarningCTAForTitanUnusedMailboxes();
			}
		}

		return null;
	}

	render() {
		const warnings = this.props.warnings;
		if ( ! warnings?.[ 0 ] ) {
			return null;
		}

		return (
			<div className="email-plan-warnings__container">
				{ warnings.map( ( warning, index ) => (
					<div className="email-plan-warnings__warning" key={ index }>
						<div className="email-plan-warnings__message">
							<span>{ warning.message }</span>
						</div>
						<div className="email-plan-warnings__cta">{ this.renderWarningCTA( warning ) }</div>
					</div>
				) ) }
			</div>
		);
	}
}

export default connect( ( state ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( EmailPlanWarnings ) );
