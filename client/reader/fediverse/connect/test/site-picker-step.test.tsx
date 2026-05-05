/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SitePickerStep } from '../site-picker-step';

// SiteSelector requires heavy Redux wiring; mock it to a simple list of
// clickable site items so we can test the onPick callback.
jest.mock( 'calypso/components/site-selector', () => ( {
	__esModule: true,
	default: ( { onSiteSelect }: { onSiteSelect: ( siteId: number ) => boolean } ) => (
		<ul>
			<li>
				<button onClick={ () => onSiteSelect( 1 ) }>Site One</button>
			</li>
			<li>
				<button onClick={ () => onSiteSelect( 2 ) }>Site Two</button>
			</li>
		</ul>
	),
} ) );

describe( 'SitePickerStep', () => {
	it( 'renders heading and description', () => {
		render( <SitePickerStep onPick={ jest.fn() } /> );
		expect( screen.getByRole( 'heading', { name: /connect a fediverse site/i } ) ).toBeVisible();
		expect( screen.getByText( /choose a wordpress\.com site/i ) ).toBeVisible();
	} );

	it( 'calls onPick with the blog id when a site is selected', async () => {
		const user = userEvent.setup();
		const onPick = jest.fn();
		render( <SitePickerStep onPick={ onPick } /> );
		await user.click( screen.getByRole( 'button', { name: /site one/i } ) );
		expect( onPick ).toHaveBeenCalledWith( 1 );
	} );

	it( 'calls onPick with the correct id for a second site', async () => {
		const user = userEvent.setup();
		const onPick = jest.fn();
		render( <SitePickerStep onPick={ onPick } /> );
		await user.click( screen.getByRole( 'button', { name: /site two/i } ) );
		expect( onPick ).toHaveBeenCalledWith( 2 );
	} );
} );
