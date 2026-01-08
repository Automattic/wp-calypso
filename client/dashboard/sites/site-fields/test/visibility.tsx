/**
 * @jest-environment jsdom
 */
import { render } from '../../../test-utils';
import { wpcomLink } from '../../../utils/link';
import { Visibility } from '../index';

describe( '<Visibility>', () => {
	test( 'for unlaunched sites, it renders "Coming soon" with a "Finish setup" link', () => {
		const { container, getByRole } = render(
			<Visibility
				siteSlug="test.wordpress.com"
				visibility="private"
				status={ null }
				isLaunched={ false }
			/>
		);
		expect( container ).toHaveTextContent( 'Finish setup↗' );
		expect( getByRole( 'link', { name: /Finish setup/ } ) ).toHaveAttribute(
			'href',
			wpcomLink( '/home/test.wordpress.com' )
		);
	} );

	test( 'for coming soon sites, it renders "Coming soon"', () => {
		const { container } = render(
			<Visibility
				siteSlug="test.wordpress.com"
				visibility="coming_soon"
				status={ null }
				isLaunched
			/>
		);
		expect( container.textContent ).toBe( 'Coming soon' );
	} );

	test( 'for private sites, it renders "Private"', () => {
		const { container } = render(
			<Visibility siteSlug="test.wordpress.com" visibility="private" status={ null } isLaunched />
		);
		expect( container.textContent ).toBe( 'Private' );
	} );

	test( 'for public sites, it renders "Public"', () => {
		const { container } = render(
			<Visibility siteSlug="test.wordpress.com" visibility="public" status={ null } isLaunched />
		);
		expect( container.textContent ).toBe( 'Public' );
	} );
} );
