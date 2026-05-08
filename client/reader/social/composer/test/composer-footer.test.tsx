/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComposerFooter } from '../composer-footer';

const noop = () => {};

describe( '<ComposerFooter>', () => {
	it( 'shows the remaining count', () => {
		render(
			<ComposerFooter graphemeCount={ 100 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByText( '200' ) ).toBeVisible();
	} );

	it( 'disables Post when count is 0', () => {
		render(
			<ComposerFooter graphemeCount={ 0 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByRole( 'button', { name: /post/i } ) ).toBeDisabled();
	} );

	it( 'disables Post when count is over the limit', () => {
		render(
			<ComposerFooter graphemeCount={ 301 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByRole( 'button', { name: /post/i } ) ).toBeDisabled();
	} );

	it( 'swaps the Post label to nudge toward the editor when over the limit', () => {
		render(
			<ComposerFooter graphemeCount={ 301 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByRole( 'button', { name: /better as a blog post/i } ) ).toBeDisabled();
		expect( screen.queryByRole( 'button', { name: /^post$/i } ) ).toBeNull();
	} );

	it( 'shows amber count under 50 remaining', () => {
		render(
			<ComposerFooter graphemeCount={ 260 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByText( '40' ) ).toHaveClass( 'is-warn' );
	} );

	it( 'shows red count at zero / negative', () => {
		render(
			<ComposerFooter graphemeCount={ 305 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByText( '-5' ) ).toHaveClass( 'is-over' );
	} );

	it( 'renders no media trigger by default — the footerStart slot is empty', () => {
		render(
			<ComposerFooter graphemeCount={ 5 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.queryByRole( 'button', { name: /add media/i } ) ).toBeNull();
	} );

	it( 'renders the supplied footerStart node into the footer', () => {
		render(
			<ComposerFooter
				graphemeCount={ 5 }
				onSubmit={ noop }
				isPending={ false }
				limit={ 300 }
				footerStart={ <button type="button">Add media</button> }
			/>
		);
		expect( screen.getByRole( 'button', { name: /add media/i } ) ).toBeVisible();
	} );

	it( 'honors the disabled prop override', () => {
		render(
			<ComposerFooter
				graphemeCount={ 50 }
				onSubmit={ noop }
				isPending={ false }
				limit={ 300 }
				disabled
			/>
		);
		expect( screen.getByRole( 'button', { name: /post/i } ) ).toBeDisabled();
	} );

	it( 'shows spinner state when pending', () => {
		const { container } = render(
			<ComposerFooter graphemeCount={ 5 } onSubmit={ noop } isPending limit={ 300 } />
		);
		expect( screen.getByRole( 'button', { name: /post/i } ) ).toBeDisabled();
		// `<Spinner>` from `@wordpress/components` renders an SVG with class
		// `components-spinner` (and `role="presentation"`), so we query by class.
		expect( container.querySelector( '.components-spinner' ) ).toBeVisible();
	} );

	it( 'fires onSubmit when Post is clicked', async () => {
		const onSubmit = jest.fn();
		const user = userEvent.setup();
		render(
			<ComposerFooter
				graphemeCount={ 10 }
				onSubmit={ onSubmit }
				isPending={ false }
				limit={ 300 }
			/>
		);
		await user.click( screen.getByRole( 'button', { name: /post/i } ) );
		expect( onSubmit ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'count is aria-live="off" outside the warn threshold', () => {
		render(
			<ComposerFooter graphemeCount={ 249 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		// remaining = 51, which is above WARN_THRESHOLD_REMAINING (50).
		expect( screen.getByText( '51' ) ).toHaveAttribute( 'aria-live', 'off' );
	} );

	it( 'count is aria-live="polite" once the warn threshold is reached', () => {
		render(
			<ComposerFooter graphemeCount={ 250 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		// remaining = 50, which equals WARN_THRESHOLD_REMAINING (boundary).
		expect( screen.getByText( '50' ) ).toHaveAttribute( 'aria-live', 'polite' );
	} );

	it( 'count is aria-live="polite" when over the limit', () => {
		render(
			<ComposerFooter graphemeCount={ 305 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByText( '-5' ) ).toHaveAttribute( 'aria-live', 'polite' );
	} );
} );
