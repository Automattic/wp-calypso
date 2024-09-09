import { getQueryArg, addQueryArgs } from '@wordpress/url';
import { QueryArgParsed } from '@wordpress/url/build-types/get-query-arg';
import StripeLogo from 'calypso/assets/images/jetpack/stripe-logo-white.svg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ImporterActionButton from '../../../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../../../importer-action-buttons/container';
import { StepProps } from '../../types';

/**
 * Update the connect URL with the from_site and engine parameters.
 * @param connectUrl
 * @param fromSite
 * @returns string
 */
function updateConnectUrl( connectUrl: string, fromSite: QueryArgParsed, engine: string ): string {
	let stateQueryString = getQueryArg( connectUrl, 'state' ) as string | string[];
	stateQueryString = Array.isArray( stateQueryString ) ? stateQueryString[ 0 ] : stateQueryString;

	const decodedState = JSON.parse( atob( stateQueryString ) );
	decodedState.from_site = fromSite;
	decodedState.engine = engine;

	return addQueryArgs( connectUrl, { state: btoa( JSON.stringify( decodedState ) ) } );
}

export default function ConnectStripe( {
	cardData,
	fromSite,
	engine,
	isFetchingContent,
}: StepProps ) {
	if ( isFetchingContent || cardData?.connect_url === undefined ) {
		return null;
	}

	const connectUrl = updateConnectUrl( cardData?.connect_url ?? '', fromSite, engine );

	return (
		<>
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
			</ImporterActionButtonContainer>
		</>
	);
}
