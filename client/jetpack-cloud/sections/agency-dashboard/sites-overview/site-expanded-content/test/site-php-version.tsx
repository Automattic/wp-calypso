/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React from 'react';
import SitePhpVersion from '../site-php-version';

describe( 'SitePhpVersion', () => {
	it( 'renders the PHP version', () => {
		const { getByText } = render( <SitePhpVersion phpVersion={ 7.4 } /> );
		expect( getByText( /php version/i ) ).toBeInTheDocument();
		expect( getByText( /7.4/i ) ).toBeInTheDocument();
	} );

	it( 'returns null when the PHP version is missing', () => {
		const { container } = render( <SitePhpVersion phpVersion={ null } /> );
		expect( container.firstChild ).toBeNull();
	} );
} );
