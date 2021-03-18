/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import { render } from 'config/testing-library';
import AdvancedCredentialsLoadingPlaceholder from '../index';

describe( 'AdvancedCredentialsLoadingPlaceholder', () => {
	it( 'should render correctly', () => {
		const { container } = render( <AdvancedCredentialsLoadingPlaceholder /> );

		expect( container ).toMatchSnapshot();
	} );
} );
