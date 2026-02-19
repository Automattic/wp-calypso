/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- AgentsManager must be imported after jest.mock */
import { render } from '@testing-library/react';
import type { AgentsManagerContextType } from '../../contexts';

// Capture props passed to the mocked UnifiedAIAgent
let capturedProps: Record< string, unknown > | null = null;

jest.mock( '../unified-ai-agent', () => ( {
	__esModule: true,
	default: function MockUnifiedAIAgent( props: Record< string, unknown > ) {
		capturedProps = props;
		return <div data-testid="mock-unified-agent" />;
	},
} ) );

// Import AgentsManager after mocking UnifiedAIAgent
import AgentsManager from '../agents-manager';

describe( 'AgentsManager', () => {
	beforeEach( () => {
		capturedProps = null;
	} );

	it( 'forwards sectionName to UnifiedAIAgent', () => {
		render( <AgentsManager sectionName="gutenberg" /> );

		expect( capturedProps ).toEqual( expect.objectContaining( { sectionName: 'gutenberg' } ) );
	} );

	it( 'forwards currentUser to UnifiedAIAgent', () => {
		const mockUser = {
			ID: 123,
			username: 'testuser',
			display_name: 'Test User',
			email: 'test@example.com',
		} as AgentsManagerContextType[ 'currentUser' ];

		render( <AgentsManager sectionName="wp-admin" currentUser={ mockUser } /> );

		expect( capturedProps ).toEqual( expect.objectContaining( { currentUser: mockUser } ) );
	} );

	it( 'forwards site to UnifiedAIAgent', () => {
		const mockSite = {
			ID: 456,
			domain: 'example.com',
		};

		render( <AgentsManager sectionName="wp-admin" site={ mockSite } /> );

		expect( capturedProps ).toEqual( expect.objectContaining( { site: mockSite } ) );
	} );

	it( 'forwards all props together to UnifiedAIAgent', () => {
		const mockUser = {
			ID: 789,
			username: 'fulltest',
			display_name: 'Full Test User',
			email: 'full@example.com',
		} as AgentsManagerContextType[ 'currentUser' ];

		const mockSite = {
			ID: 999,
			domain: 'fulltest.com',
		};

		render(
			<AgentsManager sectionName="site-editor" currentUser={ mockUser } site={ mockSite } />
		);

		expect( capturedProps ).toEqual(
			expect.objectContaining( {
				sectionName: 'site-editor',
				currentUser: mockUser,
				site: mockSite,
			} )
		);
	} );
} );
