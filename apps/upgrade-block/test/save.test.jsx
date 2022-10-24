/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { useBlockProps } from '@wordpress/block-editor';
import Save from '../src/save';
import '@testing-library/jest-dom';

jest.mock( '@wordpress/block-editor', () => ( {
	...jest.requireActual( '@wordpress/block-editor' ),
	useBlockProps: { save: jest.fn() },
} ) );

describe( 'UpgradeBlock/Save', () => {
	beforeEach( () => {
		useBlockProps.save.mockClear();
	} );

	test( 'should render', () => {
		const wrapper = render( <Save /> );
		expect( wrapper ).toMatchSnapshot();
	} );
} );
