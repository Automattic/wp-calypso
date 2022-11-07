/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { useBlockProps } from '@wordpress/block-editor';
import { Edit } from '../edit';

jest.mock( '@wordpress/block-editor', () => ( {
	...jest.requireActual( '@wordpress/block-editor' ),
	useBlockProps: jest.fn(),
} ) );

describe( 'UpgradeBlock/Edit', () => {
	beforeEach( () => {
		useBlockProps.mockClear();
	} );

	test( 'should render', () => {
		const wrapper = render( <Edit /> );
		expect( wrapper ).toMatchSnapshot();
	} );
} );
