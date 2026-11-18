import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { vi } from 'vitest';
import { renderWithProvider } from '../../../testing-library';
import { AppProvider } from '../../context';
import NodePanel, { getNotificationTabs } from '../index';
import type { FilterName } from '../../types';

const noop = () => {};

const defaultProps = {
	filterName: 'all' as FilterName,
	setFilterName: noop,
	selectedNoteId: undefined,
	setSelectedNoteId: noop,
};

// Copied from https://github.com/WordPress/gutenberg/blob/adf3ef6d41df4e70f283a35f552631668131dd95/packages/components/src/tabs/test/index.tsx#L181.
async function waitForComponentToBeInitializedWithSelectedTab(
	selectedTabName: string | undefined
) {
	if ( ! selectedTabName ) {
		// Wait for the tablist to be tabbable as a mean to know
		// that ariakit has finished initializing.
		await waitFor( () =>
			expect( screen.getByRole( 'tablist' ) ).toHaveAttribute(
				'tabindex',
				expect.stringMatching( /^(0|-1)$/ )
			)
		);
		// No initially selected tabs or tabpanels.
		await waitFor( () =>
			expect( screen.queryByRole( 'tab', { selected: true } ) ).not.toBeInTheDocument()
		);
	} else {
		// Waiting for a tab to be selected is a sign that the component
		// has fully initialized.
		expect(
			await screen.findByRole( 'tab', {
				selected: true,
				name: selectedTabName,
			} )
		).toBeVisible();
	}
}

describe( 'NotePanel', () => {
	it( 'should render correctly', async () => {
		const { getByText } = renderWithProvider( <NodePanel { ...defaultProps } /> );

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		getNotificationTabs().forEach( ( { title }: { title: string } ) => {
			expect( getByText( title ) ).toBeInTheDocument();
		} );
	} );

	it( 'should select tab on click', async () => {
		const ControlledPanel = () => {
			const [ filterName, setFilterName ] = useState< FilterName >( 'all' );
			return (
				<NodePanel
					filterName={ filterName }
					setFilterName={ setFilterName }
					selectedNoteId={ undefined }
					setSelectedNoteId={ noop }
				/>
			);
		};
		renderWithProvider( <ControlledPanel /> );

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		const nextSelectedTab = getNotificationTabs()[ 1 ];
		await userEvent.click( screen.getByRole( 'tab', { name: nextSelectedTab.title } ) );
		await waitFor( () =>
			expect(
				screen.getByRole( 'tab', {
					selected: true,
					name: nextSelectedTab.title,
				} )
			).toBeVisible()
		);
	} );

	it( 'offers the full view when the host provides one', async () => {
		const onOpenFullView = vi.fn();
		renderWithProvider(
			<AppProvider client={ null } locale="en" onOpenFullView={ onOpenFullView }>
				<NodePanel { ...defaultProps } />
			</AppProvider>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Open full view' } ) );

		expect( onOpenFullView ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'has no full view button when the host provides none', async () => {
		renderWithProvider( <NodePanel { ...defaultProps } /> );

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		expect( screen.queryByRole( 'button', { name: 'Open full view' } ) ).not.toBeInTheDocument();
	} );

	it( 'titles the panel with a third-level heading and shows its header actions by default', async () => {
		renderWithProvider( <NodePanel { ...defaultProps } /> );

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		expect( screen.getByRole( 'heading', { name: 'Notifications', level: 3 } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Settings' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Keyboard shortcuts' } ) ).toBeVisible();
	} );

	it( 'can title a page and take other header actions', async () => {
		renderWithProvider(
			<NodePanel
				{ ...defaultProps }
				headingLevel={ 1 }
				actions={ <button>Leave feedback</button> }
			/>
		);

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		expect( screen.getByRole( 'heading', { name: 'Notifications', level: 1 } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Leave feedback' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Settings' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Keyboard shortcuts' } )
		).not.toBeInTheDocument();
	} );
} );
