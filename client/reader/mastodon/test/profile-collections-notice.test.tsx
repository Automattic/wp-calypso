/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { HiddenCollectionsMessage, PartialCollectionsNotice } from '../profile-collections-notice';

describe( 'HiddenCollectionsMessage', () => {
	it( 'renders the same wording the Mastodon UI uses for hide_collections', () => {
		render( <HiddenCollectionsMessage /> );
		expect(
			screen.getByText( 'This user has chosen to not make this information available.' )
		).toBeVisible();
	} );
} );

describe( 'PartialCollectionsNotice', () => {
	it( 'renders the followers lead-in and an external link to the actor home host', () => {
		render(
			<PartialCollectionsNotice
				profileUrl="https://social.growyourown.services/@FediTips"
				mode="followers"
			/>
		);
		expect( screen.getByText( /Followers for this profile may be missing\./ ) ).toBeVisible();
		const link = screen.getByRole( 'link', { name: /social\.growyourown\.services/ } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', 'https://social.growyourown.services/@FediTips' );
	} );

	it( 'renders the following-mode lead-in when mode="following"', () => {
		render( <PartialCollectionsNotice profileUrl="https://mas.to/@alice" mode="following" /> );
		expect(
			screen.getByText( /Accounts followed by this profile may be missing\./ )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: /mas\.to/ } ) ).toBeVisible();
	} );

	it.each( [
		[ 'null', null ],
		[ 'undefined', undefined ],
		[ 'empty string', '' ],
		[ 'http (non-https)', 'http://example.com/@a' ],
		[ 'javascript: scheme', 'javascript:alert(1)' ],
		[ 'malformed url', 'not-a-url' ],
	] )( 'renders nothing when profileUrl is %s', ( _label, url ) => {
		const { container } = render(
			<PartialCollectionsNotice profileUrl={ url } mode="followers" />
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );
