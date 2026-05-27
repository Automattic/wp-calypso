import { fireEvent, render, screen } from '@testing-library/react';
import { ReelShareConfirmationDialog } from './index';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../confirmation-dialog', () => ( {
	ConfirmationDialog: ( {
		isOpen,
		title,
		actions,
		children,
	}: {
		isOpen: boolean;
		title?: string;
		actions: Array< { text: string; onClick: () => void } >;
		children: React.ReactNode;
	} ) => {
		if ( ! isOpen ) {
			return null;
		}
		return (
			<div role="dialog" aria-label={ title }>
				<p>{ children }</p>
				{ actions.map( ( a ) => (
					<button key={ a.text } onClick={ a.onClick }>
						{ a.text }
					</button>
				) ) }
			</div>
		);
	},
} ) );

describe( '<ReelShareConfirmationDialog />', () => {
	const baseProps = {
		isOpen: true,
		igDisplayName: null as string | null,
		onConfirm: jest.fn(),
		onCancel: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders nothing when isOpen is false', () => {
		render( <ReelShareConfirmationDialog { ...baseProps } isOpen={ false } /> );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the dialog with the expected title when isOpen is true', () => {
		render( <ReelShareConfirmationDialog { ...baseProps } /> );
		expect( screen.getByRole( 'dialog', { name: /Share to Instagram/i } ) ).toBeInTheDocument();
	} );

	it( 'shows the connected account handle wrapped in <strong>', () => {
		render( <ReelShareConfirmationDialog { ...baseProps } igDisplayName="myhandle" /> );

		const dialog = screen.getByRole( 'dialog' );
		expect( dialog ).toHaveTextContent( /published to myhandle on Instagram/i );

		const handle = screen.getByText( 'myhandle' );
		expect( handle.tagName ).toBe( 'STRONG' );
	} );

	it( 'falls back to a generic body when no handle is provided', () => {
		render( <ReelShareConfirmationDialog { ...baseProps } igDisplayName={ null } /> );
		expect(
			screen.getByText( /published to your connected Instagram account/i )
		).toBeInTheDocument();
	} );

	it( 'falls back to a generic body for empty-string handles', () => {
		render( <ReelShareConfirmationDialog { ...baseProps } igDisplayName="" /> );
		expect(
			screen.getByText( /published to your connected Instagram account/i )
		).toBeInTheDocument();
	} );

	it( 'invokes onConfirm when Share is clicked', () => {
		const onConfirm = jest.fn();
		render(
			<ReelShareConfirmationDialog
				{ ...baseProps }
				igDisplayName="myhandle"
				onConfirm={ onConfirm }
			/>
		);
		fireEvent.click( screen.getByRole( 'button', { name: 'Share' } ) );
		expect( onConfirm ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'invokes onCancel when Cancel is clicked', () => {
		const onCancel = jest.fn();
		render(
			<ReelShareConfirmationDialog
				{ ...baseProps }
				igDisplayName="myhandle"
				onCancel={ onCancel }
			/>
		);
		fireEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
		expect( onCancel ).toHaveBeenCalledTimes( 1 );
	} );
} );
