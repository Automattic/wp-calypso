/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FloatingPreviewPanel, { usePreviewPanelSettings } from '../floating-panel';

const restart = jest.fn();
function Panel() {
	const [ settings, setSettings, ready ] = usePreviewPanelSettings( true );
	return ready ? (
		<FloatingPreviewPanel
			title="Sites preview"
			settings={ settings }
			onChange={ setSettings }
			onRestart={ restart }
		>
			<p>Flow controls</p>
		</FloatingPreviewPanel>
	) : null;
}

test( 'collapse retains a header, restart is one action, and hide removes the entire panel without persisting hidden state', async () => {
	localStorage.setItem( 'a4a-sites-migrations-panel-v2', JSON.stringify( { hidden: true } ) );
	const view = render( <Panel /> );
	expect( await screen.findByText( 'Flow controls' ) ).toBeVisible();
	await userEvent.click( screen.getByRole( 'button', { name: 'Collapse' } ) );
	expect( screen.getByText( 'Flow controls' ) ).not.toBeVisible();
	expect( screen.getByRole( 'complementary', { name: 'Sites preview' } ) ).toBeVisible();
	await userEvent.click( screen.getByRole( 'button', { name: 'Expand' } ) );
	expect( screen.getByText( 'Flow controls' ) ).toBeVisible();
	await userEvent.click( screen.getByRole( 'button', { name: 'Restart scenario' } ) );
	expect( restart ).toHaveBeenCalledTimes( 1 );
	await userEvent.click( screen.getByRole( 'button', { name: 'Hide until refresh' } ) );
	expect( screen.queryByRole( 'complementary' ) ).not.toBeInTheDocument();
	expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	expect( JSON.parse( localStorage.getItem( 'a4a-sites-migrations-panel-v2' )! ).hidden ).toBe(
		false
	);
	view.unmount();
	render( <Panel /> );
	expect( screen.queryByRole( 'complementary' ) ).not.toBeInTheDocument();
} );
