import { Card } from '@automattic/components';
import { getQueryArg, addQueryArgs } from '@wordpress/url';
import StripeLogo from 'calypso/assets/images/jetpack/stripe-logo-white.svg';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getConnectUrlForSiteId } from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';

/**
 * Update the connect URL with the from_site and engine parameters.
 * @param connectUrl
 * @param fromSite
 * @returns string
 */
function updateConnectUrl( connectUrl: string, fromSite: string ): string {
	let stateQueryString = getQueryArg( connectUrl, 'state' ) as string | string[];
	stateQueryString = Array.isArray( stateQueryString ) ? stateQueryString[ 0 ] : stateQueryString;

	const decodedState = JSON.parse( atob( stateQueryString ) );
	decodedState.from_site = fromSite;
	decodedState.engine = 'substack'; // Currently we only support substack but in the future we want to pass this parameter down.

	return addQueryArgs( connectUrl, { state: btoa( JSON.stringify( decodedState ) ) } );
}

type Props = {
	nextStepUrl: string;
	skipNextStep: () => void;
	fromSite: string;
};

export default function ConnectStripe( { nextStepUrl, fromSite, skipNextStep }: Props ) {
	const site = useSelector( getSelectedSite );
	let connectUrl: string = useSelector( ( state ) => getConnectUrlForSiteId( state, site?.ID ) );

	try {
		connectUrl = updateConnectUrl( connectUrl, fromSite );
	} catch ( error ) {
		// Do nothing
	}

	return (
		<Card>
			<h2>Finish importing paid subscribers</h2>
			<p>
				To your migrate <strong>17 paid subscribers</strong> to WordPress.com, make sure you're
				connecting the same Stripe account you use with Substack.
			</p>
			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton
					primary
					href={ connectUrl }
					onClick={ () => {
						recordTracksEvent( 'calypso_paid_importer_connect_stripe' );
					} }
				>
					Connect <img src={ StripeLogo } className="stripe-logo" width="48px" alt="Stripe logo" />
				</ImporterActionButton>
				<ImporterActionButton
					href={ nextStepUrl }
					onClick={ () => {
						recordTracksEvent( 'calypso_paid_importer_connect_stripe_skipped' );
						skipNextStep();
					} }
				>
					Skip for now
				</ImporterActionButton>
			</ImporterActionButtonContainer>
		</Card>
	);
}
