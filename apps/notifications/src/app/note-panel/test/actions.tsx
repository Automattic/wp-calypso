import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { init as initStore } from '../../../panel/state';
import { addListeners } from '../../../panel/state/create-listener-middleware';
import { AppProvider } from '../../context';
import NotePanel from '../index';
import type { FilterName } from '../../types';

const noop = () => {};

describe( 'NotePanel settings button', () => {
	it( 'asks the host for the settings page without opening a menu', async () => {
		const store = initStore();
		const onViewSettings = jest.fn();
		store.dispatch( addListeners( { VIEW_SETTINGS: [ onViewSettings ] } ) );

		render(
			<Provider store={ store }>
				<AppProvider client={ null } locale="en" isViewSettingsEnabled>
					<NotePanel
						filterName={ 'all' as FilterName }
						setFilterName={ noop }
						selectedNoteId={ undefined }
						setSelectedNoteId={ noop }
					/>
				</AppProvider>
			</Provider>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Settings' } ) );

		expect( onViewSettings ).toHaveBeenCalled();
		expect( screen.queryByRole( 'menu' ) ).not.toBeInTheDocument();
	} );
} );
