/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { vi } from 'vitest';
import { HelpCenterA4ASiteField } from '../help-center-a4a-site-field';

vi.mock( '../../data/use-a4a-agency-sites', () => ( {
	useA4AAgencySites: () => ( {
		data: [
			{ blog_id: 1, url: 'acme.example.com', blogname: 'Acme' },
			{ blog_id: 2, url: 'bakery.example.com' },
		],
		isFetching: false,
	} ),
} ) );

beforeAll( () => {
	// jsdom doesn't implement scrollIntoView, which the combobox calls on the highlighted option.
	window.HTMLElement.prototype.scrollIntoView = vi.fn();
} );

const renderField = () => {
	const onChange = vi.fn();

	const Wrapper = () => {
		const [ value, setValue ] = useState( '' );
		return (
			<HelpCenterA4ASiteField
				agencyId={ 123 }
				label="Related site"
				value={ value }
				onChange={ ( nextValue ) => {
					setValue( nextValue );
					onChange( nextValue );
				} }
			/>
		);
	};

	render( <Wrapper /> );
	return { onChange };
};

describe( 'HelpCenterA4ASiteField', () => {
	it( 'stores the URL of the agency site the user picks', async () => {
		const user = userEvent.setup();
		const { onChange } = renderField();

		await user.type( screen.getByRole( 'combobox', { name: 'Related site' } ), 'acme' );
		await user.click( screen.getByRole( 'option', { name: 'Acme (acme.example.com)' } ) );

		expect( onChange ).toHaveBeenLastCalledWith( 'acme.example.com' );
	} );

	it( 'stores a typed address that is not one of the agency sites', async () => {
		const user = userEvent.setup();
		const { onChange } = renderField();

		await user.type( screen.getByRole( 'combobox', { name: 'Related site' } ), 'other.com' );
		await user.click( screen.getByRole( 'option', { name: 'Use “other.com”' } ) );

		expect( onChange ).toHaveBeenLastCalledWith( 'other.com' );
	} );
} );
