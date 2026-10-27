/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageDots from '../';
import { render } from '../../../test-utils';

describe( '<PageDots>', () => {
	test( 'marks the current page and jumps to a page when its dot is clicked', async () => {
		const onChange = jest.fn();
		render( <PageDots count={ 3 } current={ 1 } onChange={ onChange } label="Tour sections" /> );

		expect( screen.getByRole( 'button', { name: 'Page 2 of 3' } ) ).toHaveAttribute(
			'aria-current',
			'step'
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Page 3 of 3' } ) );
		expect( onChange ).toHaveBeenCalledWith( 2 );
	} );
} );
