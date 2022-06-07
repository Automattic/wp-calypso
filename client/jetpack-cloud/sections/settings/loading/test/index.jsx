/**
 * @jest-environment jsdom
 */

import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AdvancedCredentialsLoadingPlaceholder from '../index';

describe( 'AdvancedCredentialsLoadingPlaceholder', () => {
	it( 'should render correctly', () => {
		const { container } = renderWithProvider( <AdvancedCredentialsLoadingPlaceholder /> );

		expect( container ).toMatchSnapshot();
	} );
} );
