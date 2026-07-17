import { getIsAgentsManagerAvailable } from '../is-agents-manager-available';

type TestWindow = Window & {
	__agentsManagerActions?: {
		isCompactMode?: boolean;
		isReady?: boolean;
	};
};

const testWindow = window as TestWindow;

describe( 'getIsAgentsManagerAvailable', () => {
	afterEach( () => {
		delete testWindow.__agentsManagerActions;
	} );

	it( 'returns false when the Agents Manager actions global is missing', () => {
		expect( getIsAgentsManagerAvailable() ).toBe( false );
	} );

	it( 'returns false when the actions global is present but not ready', () => {
		testWindow.__agentsManagerActions = {
			isCompactMode: true,
		};

		expect( getIsAgentsManagerAvailable() ).toBe( false );
	} );

	it( 'returns false when the actions global explicitly is not ready', () => {
		testWindow.__agentsManagerActions = {
			isReady: false,
		};

		expect( getIsAgentsManagerAvailable() ).toBe( false );
	} );

	it( 'returns true when the non-headless Agents Manager actions are ready', () => {
		testWindow.__agentsManagerActions = {
			isReady: true,
		};

		expect( getIsAgentsManagerAvailable() ).toBe( true );
	} );
} );
