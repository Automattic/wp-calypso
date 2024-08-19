import { Card } from '@automattic/components';
import { getQueryArg, addQueryArgs } from '@wordpress/url';
import StripeLogo from 'calypso/assets/images/jetpack/stripe-logo-white.svg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';

/**
 * Update the connect URL with the from_site and engine parameters.
 * @param connectUrl
 * @param fromSite
 * @returns string
 */
function updateConnectUrl( connectUrl: string, fromSite: string, engine: string ): string {
	let stateQueryString = getQueryArg( connectUrl, 'state' ) as string | string[];
	stateQueryString = Array.isArray( stateQueryString ) ? stateQueryString[ 0 ] : stateQueryString;

	const decodedState = JSON.parse( atob( stateQueryString ) );
	decodedState.from_site = fromSite;
	decodedState.engine = engine;

	return addQueryArgs( connectUrl, { state: btoa( JSON.stringify( decodedState ) ) } );
}

type Props = {
	nextStepUrl: string;
	skipNextStep: () => void;
	cardData: any;
	fromSite: string;
	engine: string;
	isFetchingContent: boolean;
};

export default function ConnectStripe( {
	nextStepUrl,
	skipNextStep,
	cardData,
	fromSite,
	engine,
	isFetchingContent,
}: Props ) {
	if ( isFetchingContent || cardData?.connect_url === undefined ) {
		return null;
	}

	const connectUrl = updateConnectUrl( cardData?.connect_url ?? '', fromSite, engine );

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
