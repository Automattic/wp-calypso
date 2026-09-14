/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import GSuiteSingleFeature from '../single-feature';

describe( 'GSuiteSingleFeature', () => {
	test( 'it renders GSuiteSingleFeature', () => {
		const { container } = render(
			<GSuiteSingleFeature
				title="title"
				description="description"
				imagePath="/test/image/path.svg"
				imageAlt="image alt"
				compact={ false }
			/>
		);

		expect( container.firstChild ).toMatchSnapshot();
	} );
} );
