/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TopicsTab } from '../topics-tab';
import type { ComponentProps } from 'react';

function setup( overrides: Partial< ComponentProps< typeof TopicsTab > > = {} ) {
	const props: ComponentProps< typeof TopicsTab > = {
		tags: [],
		onTagsChange: jest.fn(),
		languages: [],
		onLanguagesChange: jest.fn(),
		...overrides,
	};
	const user = userEvent.setup();
	renderWithProvider( <TopicsTab { ...props } /> );
	return { props, user };
}

describe( 'TopicsTab', () => {
	it( 'renders the description, tags and languages controls together', () => {
		setup( { languages: [ 'en' ] } );

		expect(
			screen.getByText(
				'Besides posts from the feeds you follow, this shelf can show posts that match these tags, in the languages you choose.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'combobox', { name: 'Tags' } ) ).toBeVisible();
		expect( screen.getByRole( 'combobox', { name: 'Languages' } ) ).toBeVisible();
		// The selected language is shown by its display name.
		expect( screen.getByText( 'English' ) ).toBeVisible();
	} );

	it( 'reports an added tag', async () => {
		const { props, user } = setup();

		await user.type( screen.getByRole( 'combobox', { name: 'Tags' } ), 'design[Enter]' );

		expect( props.onTagsChange ).toHaveBeenCalledWith( [ 'design' ] );
	} );

	it( 'reports an added language as a base code', async () => {
		const { props, user } = setup();

		await user.type( screen.getByRole( 'combobox', { name: 'Languages' } ), 'English[Enter]' );

		expect( props.onLanguagesChange ).toHaveBeenCalledWith( [ 'en' ] );
	} );

	it( 'renders tag and language count errors', () => {
		setup( {
			tagsError: 'You can add up to 8 tags.',
			languagesError: 'You can add up to 5 languages.',
		} );

		expect( screen.getByText( 'You can add up to 8 tags.' ) ).toBeVisible();
		expect( screen.getByText( 'You can add up to 5 languages.' ) ).toBeVisible();
	} );
} );
