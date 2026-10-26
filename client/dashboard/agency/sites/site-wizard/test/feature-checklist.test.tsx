/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import FeatureChecklist from '../feature-checklist';

const detail = 'Connect now and choose migration help when you’re ready to switch.';

function Checklist() {
	return (
		<FeatureChecklist
			title="Connect a site"
			features={ [ { label: 'Switch hosting later', detail } ] }
		/>
	);
}

test( 'reveals a feature explanation on hover and dismisses it with Escape', async () => {
	const user = userEvent.setup();
	render( <Checklist /> );
	expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument();
	await user.hover( screen.getByRole( 'button', { name: /Switch hosting later/ } ) );
	expect( await screen.findByRole( 'tooltip' ) ).toHaveTextContent( detail );
	await user.keyboard( '{Escape}' );
	await waitFor( () => expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument() );
} );

test( 'makes the explanation available from the keyboard without moving focus', async () => {
	const user = userEvent.setup();
	render( <Checklist /> );
	await user.tab();
	const feature = screen.getByRole( 'button', { name: /Switch hosting later/ } );
	expect( feature ).toHaveFocus();
	expect( await screen.findByRole( 'tooltip' ) ).toHaveTextContent( detail );
	expect( feature ).toHaveAccessibleDescription( detail );
	await user.keyboard( '{Escape}' );
	await waitFor( () => expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument() );
	expect( feature ).toHaveFocus();
} );

test( 'follows the pointer within a feature and closes when it leaves', async () => {
	const width = jest
		.spyOn( document.documentElement, 'clientWidth', 'get' )
		.mockReturnValue( 1200 );
	const height = jest
		.spyOn( document.documentElement, 'clientHeight', 'get' )
		.mockReturnValue( 900 );
	try {
		const user = userEvent.setup();
		render( <Checklist /> );
		const feature = screen.getByRole( 'button', { name: /Switch hosting later/ } );
		await user.pointer( { target: feature, coords: { clientX: 100, clientY: 100 } } );
		const tooltip = await screen.findByRole( 'tooltip' );
		await waitFor( () => expect( tooltip ).toHaveClass( 'is-positioned' ) );
		const firstPosition = tooltip.style.transform;
		await user.pointer( { target: feature, coords: { clientX: 160, clientY: 120 } } );
		await waitFor( () => expect( tooltip.style.transform ).not.toBe( firstPosition ) );
		await user.unhover( feature );
		await waitFor( () => expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument() );
	} finally {
		width.mockRestore();
		height.mockRestore();
	}
} );
