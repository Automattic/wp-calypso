import { getAgentsManagerInlineData } from '@automattic/agents-manager';
import { isConnectedSelfHosted } from './is-connected-self-hosted';

jest.mock( '@automattic/agents-manager', () => ( {
	getAgentsManagerInlineData: jest.fn(),
} ) );

const mockGetAgentsManagerInlineData = getAgentsManagerInlineData as jest.Mock;

describe( 'isConnectedSelfHosted', () => {
	it.each( [
		{ label: 'connected self-hosted', inlineData: { isWpcomPlatform: false }, expected: true },
		{ label: 'hosted', inlineData: { isWpcomPlatform: true }, expected: false },
		{ label: 'unknown', inlineData: undefined, expected: false },
	] )( 'returns $expected for $label', ( { inlineData, expected } ) => {
		mockGetAgentsManagerInlineData.mockReturnValue( inlineData );

		expect( isConnectedSelfHosted() ).toBe( expected );
	} );
} );
