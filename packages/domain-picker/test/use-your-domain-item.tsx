/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import UseYourDomainItem from '../src/domain-picker/use-your-domain-item';

describe( '<UseYourDomainItem />', () => {
	test( 'Component renders correct text', () => {
		render(
			<UseYourDomainItem
				siteSlug="test.wordpress.com"
				source="https://wordpress.com/page/test.worpdress.com/home"
			/>
		);

		expect( screen.getByText( 'Already own a domain?' ) ).toBeTruthy();
		expect( screen.getByText( "You can use it as your site's address" ) ).toBeTruthy();
	} );

	test( 'Component renders correctly', () => {
		render(
			<UseYourDomainItem
				siteSlug="test.wordpress.com"
				source="https://wordpress.com/page/test.worpdress.com/home"
			/>
		);

		expect( screen.getByText( 'Use a domain I own' ).closest( 'a' ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/start/new-launch/domains-launch/use-your-domain/?siteSlug=test.wordpress.com&source=https://wordpress.com/page/test.worpdress.com/home'
		);
	} );
} );
