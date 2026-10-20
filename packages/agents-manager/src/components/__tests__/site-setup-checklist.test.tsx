/**
 * @jest-environment jsdom
 */
jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		AgentUIChecklist: () => <div data-testid="checklist" />,
	} ),
	{ virtual: true }
);

import { act, render, screen } from '@testing-library/react';
import SiteSetupChecklist from '../site-setup-checklist';

const nextFrame = () =>
	act( async () => {
		await new Promise( ( resolve ) => window.requestAnimationFrame( () => resolve( null ) ) );
	} );

describe( 'SiteSetupChecklist', () => {
	it( 'renders the bare checklist in the empty view', () => {
		const { container } = render(
			<SiteSetupChecklist items={ [] } collapsedByDefault={ false } onSelect={ jest.fn() } />
		);

		expect( screen.getByTestId( 'checklist' ) ).toBeInTheDocument();
		expect( container.querySelector( '.agents-manager-site-setup-checklist--pinned' ) ).toBeNull();
	} );

	it( 'unfolds the pinned block on the frame after it mounts', async () => {
		const { container } = render(
			<SiteSetupChecklist items={ [] } collapsedByDefault onSelect={ jest.fn() } pinned />
		);
		const block = container.querySelector( '.agents-manager-site-setup-checklist--pinned' );

		expect( block ).not.toHaveClass( 'is-entered' );

		await nextFrame();

		expect( block ).toHaveClass( 'is-entered' );
		expect( screen.getByTestId( 'checklist' ) ).toBeInTheDocument();
	} );
} );
