/**
 * @jest-environment jsdom
 */
import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { getOdieTransferMessages } from '../constants';

jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: jest.fn().mockReturnValue( false ),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { PLANS_PRESALES_LAUNCHER_CONTEXT: 'plans-presales' },
} ) );

const contents = ( ...args: Parameters< typeof getOdieTransferMessages > ) =>
	getOdieTransferMessages( ...args ).map( ( { content } ) => content );

const ASK_FOR_DETAILS = 'Tell us what you need help with while you wait.';

beforeEach( () => {
	( isTestModeEnvironment as jest.Mock ).mockReturnValue( false );
} );

describe( 'getOdieTransferMessages', () => {
	it( 'refers back to the AI chat after a handoff from Odie', () => {
		expect( contents() ).toEqual( [
			'No problem. Help is on the way!',
			'A Happiness Engineer will reply as soon as they are available, either here or by email.',
			'They can see this conversation, so please add any other details that may help.',
		] );
	} );

	it( 'asks for the details when the user went straight to a human', () => {
		expect( contents( () => true, true ) ).toEqual( [
			'A Happiness Engineer will reply as soon as they are available, either here or by email.',
			ASK_FOR_DETAILS,
		] );
	} );

	it( 'leaves out the request for details until it is translated', () => {
		const hasEnTranslation = ( text: string ) => text !== ASK_FOR_DETAILS;

		expect( contents( hasEnTranslation, true ) ).toEqual( [
			'A Happiness Engineer will reply as soon as they are available, either here or by email.',
		] );
	} );

	it( 'shows the sandbox notice instead of the reply promise in test mode', () => {
		( isTestModeEnvironment as jest.Mock ).mockReturnValue( true );

		const messages = contents( () => true, true );

		expect( messages ).toHaveLength( 2 );
		expect( messages[ 0 ] ).toMatch( /^This is the Sandbox version of Zendesk/ );
		expect( messages[ 1 ] ).toBe( ASK_FOR_DETAILS );
	} );
} );
