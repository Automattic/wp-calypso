/**
 * @jest-environment jsdom
 */

import { render } from 'config/testing-library';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import AdvancedCredentialsLoadingPlaceholder from '../index';

describe( 'AdvancedCredentialsLoadingPlaceholder', () => {
	it( 'should render correctly', () => {
		const { container } = render( <AdvancedCredentialsLoadingPlaceholder /> );

		expect( container ).toMatchSnapshot();
	} );
} );
