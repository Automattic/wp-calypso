/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getJetpackCredentialsUpdateStatus from 'state/selectors/get-jetpack-credentials-update-status';
import getRewindState from 'state/selectors/get-rewind-state';
import meta from './meta';
import {
	ButtonRow,
	ConditionalBlock,
	Continue,
	makeTour,
	Quit,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import { not } from 'layout/guided-tours/utils';
import { getSelectedSiteId } from 'state/ui/selectors';

function whenWeCanAutoconfigure( state ) {
	const siteId = getSelectedSiteId( state );
	const { canAutoconfigure, credentials = [] } = getRewindState( state, siteId );

	return canAutoconfigure || credentials.some( ( c ) => c.type === 'auto' );
}

const JetpackBackupsRewindTourButtons = ( { backText, translate } ) => (
	<Fragment>
		<SiteLink isButton isPrimaryButton={ false } href="/plans/my-plan/:site">
			{ backText || translate( 'Return to the checklist' ) }
		</SiteLink>
		<Quit>{ translate( 'No, thanks.' ) }</Quit>
	</Fragment>
);

const ContinueToLastStep = ( { siteHasCredentials } ) => (
	<Continue
		target=".rewind-credentials-form .is-primary"
		step="finish"
		when={ () => siteHasCredentials }
		click
		hidden
	/>
);
const ConnectedContinueToLastStep = connect( ( state ) => ( {
	siteHasCredentials:
		getJetpackCredentialsUpdateStatus( state, getSelectedSiteId( state ) ) === 'success',
} ) )( ContinueToLastStep );

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const JetpackBackupsRewindTour = makeTour(
	<Tour { ...meta }>
		<Step name="init" target=".credentials-setup-flow" placement="below" arrow="top-left">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"Let's enable Jetpack backups and restores " +
								'by adding access credentials for your site.'
						) }
					</p>
					<ButtonRow>
						<Continue
							target=".credentials-setup-flow__setup-start"
							step="autoconfigureOrConfirm"
							click
							hidden
						/>
						<JetpackBackupsRewindTourButtons translate={ translate } />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="autoconfigureOrConfirm"
			target=".credentials-setup-flow__tos .is-primary"
			placement="below"
			arrow="top-left"
		>
			{ ( { translate } ) => (
				<Fragment>
					<ConditionalBlock when={ whenWeCanAutoconfigure }>
						<p>
							{ translate(
								"You can click this button to provide WordPress.com with access to your host's server."
							) }
						</p>
						<ButtonRow>
							<Continue
								target=".credentials-setup-flow__tos-buttons .is-primary"
								step="finish"
								click
								hidden
							/>
							<JetpackBackupsRewindTourButtons translate={ translate } />
						</ButtonRow>
					</ConditionalBlock>
					<ConditionalBlock when={ not( whenWeCanAutoconfigure ) }>
						<p>
							{ translate(
								'You can click the button in order to agree and continue to the credentials form.'
							) }
						</p>
						<ButtonRow>
							<Continue
								target=".credentials-setup-flow__tos-buttons .is-primary"
								step="credentials"
								click
								hidden
							/>
							<JetpackBackupsRewindTourButtons translate={ translate } />
						</ButtonRow>
					</ConditionalBlock>
				</Fragment>
			) }
		</Step>

		<Step
			name="credentials"
			target=".rewind-credentials-form"
			style={ {
				display: 'none',
			} }
		>
			{ () => <ConnectedContinueToLastStep /> }
		</Step>

		<Step name="finish" target=".credentials-configured" placement="right">
			{ ( { translate } ) => (
				<Fragment>
					<h1 className="tours__title">
						<span className="tours__completed-icon-wrapper">
							<Gridicon icon="checkmark" className="tours__completed-icon" />
						</span>
						{ translate( 'Excellent, you’re done!' ) }
					</h1>
					<p>
						{ translate(
							'Jetpack Backups has been enabled. Would you like to continue setting up the security essential features for your site?'
						) }
					</p>
					<ButtonRow>
						<JetpackBackupsRewindTourButtons
							translate={ translate }
							backText={ translate( "Yes, let's do it." ) }
						/>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
