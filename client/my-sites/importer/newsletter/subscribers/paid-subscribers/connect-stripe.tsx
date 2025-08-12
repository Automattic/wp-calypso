import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg, addQueryArgs } from '@wordpress/url';
import { QueryArgParsed } from '@wordpress/url/build-types/get-query-arg';
import { fixMe } from 'i18n-calypso';
import StripeLogoSvg from 'calypso/assets/images/jetpack/stripe-logo-white.svg';
import { navigate } from 'calypso/lib/navigate';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ImporterActionButton from '../../../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../../../importer-action-buttons/container';
import { SubscribersStepProps } from '../../types';
import StartImportButton from '../start-import-button';
import SuccessNotice from './success-notice';

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
	selectedSite,
	siteSlug,
}: SubscribersStepProps ) {
	const { __ } = useI18n();
	if ( cardData?.connect_url === undefined ) {
		return null;
	}

	const connectUrl = updateConnectUrl( cardData?.connect_url ?? '', fromSite, engine );
	const allEmailsCount = parseInt( cardData?.meta?.email_count || '0' );

	return (
		<>
			<SuccessNotice allEmailsCount={ allEmailsCount } />
			<h2>{ __( 'Do you have paid subscribers?' ) } </h2>
			<p>
				{ createInterpolateElement(
					__(
						"To migrate your <strong>paid subscribers</strong>, make sure you're connecting the <strong>same</strong> Stripe account you use with Substack."
					),
					{
						strong: <strong />,
					}
				) }
			</p>
			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton
					primary
					href={ connectUrl }
					onClick={ () => {
						recordTracksEvent( 'calypso_paid_importer_connect_stripe' );
					} }
					aria-label={ __( 'Connect Stripe' ) }
				>
					{ createInterpolateElement( __( 'Connect <StripeLogo />' ), {
						StripeLogo: (
							<img src={ StripeLogoSvg } className="stripe-logo" width="48" alt="Stripe" />
						),
					} ) }
				</ImporterActionButton>
				<StartImportButton
					engine={ engine }
					siteId={ selectedSite.ID }
					step="subscribers"
					primary={ false }
					navigate={ () => {
						navigate( `/import/newsletter/${ engine }/${ siteSlug }/summary?from=${ fromSite }` );
					} }
					label={
						fixMe( {
							text: 'Continue with free subscribers',
							newCopy: __( 'Continue with free subscribers' ),
							oldCopy: __( 'I have only free subscribers' ),
						} ) as string
					}
				/>
			</ImporterActionButtonContainer>
		</>
	);
}
