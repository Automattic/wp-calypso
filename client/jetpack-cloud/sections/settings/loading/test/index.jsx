/**
 * @jest-environment jsdom
 */

import { render } from 'calypso/test-helpers/config/testing-library';
import '@testing-library/jest-dom/extend-expect';
import AdvancedCredentialsLoadingPlaceholder from '../index';

describe( 'AdvancedCredentialsLoadingPlaceholder', () => {
	it( 'should render correctly', () => {
		const { container } = render( <AdvancedCredentialsLoadingPlaceholder /> );

		expect( container ).toMatchSnapshot();
	} );
} );
