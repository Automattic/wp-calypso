/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
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

	return canAutoconfigure || credentials.some( c => c.type === 'auto' );
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const JetpackBackupsRewindTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target=".credentials-setup-flow"
			placement="beside"
			arrow="right-top"
			style={ {
				animationDelay: '0.7s',
				zIndex: 1,
			} }
		>
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
						<SiteLink href="/plans/my-plan/:site">
							{ translate( 'Return to the checklist' ) }
						</SiteLink>
						<Quit>{ translate( 'No, thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="autoconfigureOrConfirm"
			target=".credentials-setup-flow__tos"
			placement="beside"
			arrow="right-top"
			style={ {
				display: 'none',
			} }
		>
			{ () => (
				<Fragment>
					<ConditionalBlock when={ whenWeCanAutoconfigure }>
						<Continue
							target=".credentials-setup-flow__tos-buttons .is-primary"
							step="finish"
							click
							hidden
						/>
					</ConditionalBlock>
					<ConditionalBlock when={ not( whenWeCanAutoconfigure ) }>
						<Continue
							target=".credentials-setup-flow__tos-buttons .is-primary"
							step="credentials"
							click
							hidden
						/>
					</ConditionalBlock>
				</Fragment>
			) }
		</Step>

		<Step
			name="credentials"
			target=".rewind-credentials-form"
			placement="beside"
			arrow="right-top"
			style={ {
				display: 'none',
			} }
		>
			{ () => (
				<Continue target=".rewind-credentials-form .is-primary" step="finish" click hidden />
			) }
		</Step>

		<Step name="finish" target=".credentials-configured" placement="beside" arrow="right-top">
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
						<SiteLink isButton href="/plans/my-plan/:site">
							{ translate( "Yes, let's do it." ) }
						</SiteLink>
						<Quit>{ translate( 'No thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
