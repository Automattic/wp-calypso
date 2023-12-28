/**
 * External dependencies
 */
import { createReduxStore, register } from '@wordpress/data';
/**
 * Internal dependencies
 */
import actions from './actions';
import reducer from './reducer';
import selectors from './selectors';

export const STORE_NAME = 'jetpack-ai/logo-generator';

const jetpackAiLogoGeneratorStore = createReduxStore( STORE_NAME, {
	// @ts-expect-error -- TSCONVERSION
	__experimentalUseThunks: true,

	actions,

	reducer,

	selectors,

	resolvers: {
		getAiAssistantFeature: ( siteId: string ) =>
			actions.fetchAiAssistantFeature( String( siteId ) ),
	},
} );

register( jetpackAiLogoGeneratorStore );
