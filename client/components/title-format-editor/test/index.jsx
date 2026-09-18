/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { TitleFormatEditor } from '..';

describe( 'TitleFormatEditor', () => {
	beforeAll( () => {
		window.scrollTo = jest.fn();
	} );

	test( 'adds a token to the Draft.js editor state', () => {
		const onChange = jest.fn();

		render(
			<TitleFormatEditor
				onChange={ onChange }
				shouldShowSeoArchiveTitleButton={ false }
				titleData={ {
					post: { title: 'Example title' },
					site: { description: 'Example tagline', name: 'Example site' },
				} }
				titleFormats={ [] }
				tokens={ { siteName: 'Site Name' } }
				translate={ ( value ) => value }
				type={ { label: 'Post title', value: 'posts' } }
			/>
		);

		fireEvent.click( screen.getByText( 'Site Name' ) );

		expect( onChange ).toHaveBeenCalledWith( 'posts', [ { type: 'siteName' } ] );
	} );
} );
