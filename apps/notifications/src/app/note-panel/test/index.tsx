import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigator } from '@wordpress/components';
import { renderWithProvider } from '../../../testing-library';
import NodePanel, { getNotificationTabs } from '../index';

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
		const { getByText } = renderWithProvider( <NodePanel /> );

		await waitForComponentToBeInitializedWithSelectedTab( getNotificationTabs()[ 0 ].title );

		getNotificationTabs().forEach( ( { title }: { title: string } ) => {
			expect( getByText( title ) ).toBeInTheDocument();
		} );
	} );

	it( 'should select tab on click', async () => {
		renderWithProvider(
			<Navigator initialPath="/all">
				<Navigator.Screen path="/:filterName">
					<NodePanel />
				</Navigator.Screen>
			</Navigator>
		);

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
} );
