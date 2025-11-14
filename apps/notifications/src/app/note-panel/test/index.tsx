import { waitFor } from '@testing-library/react';
import { renderWithProvider } from '../../../testing-library';
import NodePanel, { NOTIFICATION_TABS } from '../index';

describe( 'NotePanel', () => {
	it( 'should render correctly', async () => {
		const { getByText } = renderWithProvider( <NodePanel /> );

		// Avoid the Tabs components that update state asynchronously to trigger warnings.
		await waitFor( () => {
			NOTIFICATION_TABS.forEach( ( { title }: { title: string } ) => {
				expect( getByText( title ) ).toBeInTheDocument();
			} );
		} );
	} );
} );
