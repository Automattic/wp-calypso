/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/calypso-config', () => {
	const configApi = () => '';
	configApi.isEnabled = jest.fn( ( flag ) => flag === 'is_odyssey' );
	return configApi;
} );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( { type: 'ANALYTICS_EVENT_RECORD' } ) ),
} ) );

import { render, screen } from '@testing-library/react';
import { Banner } from '../index';

const props = {
	title: 'banner title',
	siteSlug: 'example.com',
	canUserUpgrade: true,
};

describe( 'Banner hrefs in wp-admin (Odyssey)', () => {
	test( 'absolutizes the computed plans href', () => {
		const { container } = render( <Banner { ...props } /> );

		expect( container.querySelector( 'a' ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/plans/example.com'
		);
	} );

	test( 'absolutizes the computed plans href with feature and plan args', () => {
		const { container } = render(
			<Banner { ...props } feature="advanced-seo" plan="business-bundle" />
		);

		expect( container.querySelector( 'a' ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/plans/example.com?feature=advanced-seo&plan=business-bundle'
		);
	} );

	test( 'absolutizes the computed plans href with a customerType arg', () => {
		const { container } = render( <Banner { ...props } customerType="business" /> );

		expect( container.querySelector( 'a' ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/plans/example.com?customerType=business'
		);
	} );

	test( 'absolutizes a caller-provided href', () => {
		const { container } = render( <Banner { ...props } href="/post/example.com" /> );

		expect( container.querySelector( 'a' ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/post/example.com'
		);
	} );

	test( 'absolutizes the call-to-action button href', () => {
		render( <Banner { ...props } callToAction="Upgrade" forceHref={ false } /> );

		expect( screen.getByRole( 'link', { name: 'Upgrade' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/plans/example.com'
		);
	} );

	test( 'absolutizes the secondary call-to-action href', () => {
		render(
			<Banner
				{ ...props }
				callToAction="Upgrade"
				secondaryCallToAction="Learn more"
				secondaryHref="/support/example.com"
			/>
		);

		expect( screen.getByRole( 'link', { name: 'Learn more' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/support/example.com'
		);
	} );

	test( 'leaves an absolute href untouched', () => {
		const { container } = render(
			<Banner { ...props } href="https://example.com/wp-admin/admin.php?page=stats" />
		);

		expect( container.querySelector( 'a' ) ).toHaveAttribute(
			'href',
			'https://example.com/wp-admin/admin.php?page=stats'
		);
	} );
} );
