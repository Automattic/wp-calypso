/**
 * @jest-environment jsdom
 */
const mockAgentUIChecklist = jest.fn< ReactElement, [ unknown ] >( () => (
	<div data-testid="checklist" />
) );
jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		AgentUIChecklist: ( props: unknown ) => mockAgentUIChecklist( props ),
	} ),
	{ virtual: true }
);

import { act, render, screen } from '@testing-library/react';
import SiteSetupChecklist from '../site-setup-checklist';
import type { ReactElement } from 'react';

const nextFrame = () =>
	act( async () => {
		await new Promise( ( resolve ) => window.requestAnimationFrame( () => resolve( null ) ) );
	} );

describe( 'SiteSetupChecklist', () => {
	it( 'renders the bare checklist, open, in the empty view', () => {
		const { container } = render( <SiteSetupChecklist items={ [] } variant="empty" busy /> );

		expect( screen.getByTestId( 'checklist' ) ).toBeInTheDocument();
		expect( container.querySelector( '.agents-manager-site-setup-checklist--pinned' ) ).toBeNull();
		expect( mockAgentUIChecklist ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				defaultCollapsed: false,
				busy: true,
				focusHeaderOnMount: false,
				resumeInProgress: true,
			} )
		);
	} );

	it( 'unfolds the pinned block, folded and focused, on the frame after it mounts', async () => {
		const { container } = render(
			<SiteSetupChecklist items={ [] } variant="pinned" focusHeaderOnMount activeItemId="about" />
		);
		expect( mockAgentUIChecklist ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				defaultCollapsed: true,
				focusHeaderOnMount: true,
				activeItemId: 'about',
			} )
		);
		const block = container.querySelector( '.agents-manager-site-setup-checklist--pinned' );

		expect( block ).not.toHaveClass( 'is-entered' );

		await nextFrame();

		expect( block ).toHaveClass( 'is-entered' );
		expect( screen.getByTestId( 'checklist' ) ).toBeInTheDocument();
	} );
} );
