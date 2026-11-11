import { adaptReadFourForFourCandidate } from '../adapters';

describe( 'adaptReadFourForFourCandidate', () => {
	const wire = {
		blog_id: 2,
		feed_id: 20,
		name: 'Two',
		url: 'https://two.wordpress.com',
		feed_url: 'https://two.wordpress.com/feed/',
		description: 'About two',
		icon: 'https://two.wordpress.com/icon.png',
		is_participant: true,
	};

	it( 'maps the wire shape onto the client candidate and its Reader site', () => {
		expect( adaptReadFourForFourCandidate( wire ) ).toEqual( {
			blogId: 2,
			feedId: 20,
			name: 'Two',
			url: 'https://two.wordpress.com',
			feedUrl: 'https://two.wordpress.com/feed/',
			icon: 'https://two.wordpress.com/icon.png',
			isParticipant: true,
			streamKey: 'feed:20',
			site: {
				ID: 2,
				feed_ID: 20,
				title: 'Two',
				name: 'Two',
				URL: 'https://two.wordpress.com',
				feed_URL: 'https://two.wordpress.com/feed/',
				description: 'About two',
				icon: { img: 'https://two.wordpress.com/icon.png' },
			},
		} );
	} );

	it( 'falls back to a site stream and no icon when the feed and icon are missing', () => {
		const adapted = adaptReadFourForFourCandidate( {
			...wire,
			feed_id: 0,
			icon: null,
			description: undefined,
		} );

		expect( adapted.streamKey ).toBe( 'site:2' );
		expect( adapted.icon ).toBeNull();
		expect( adapted.site.icon ).toBeUndefined();
		expect( adapted.site.description ).toBe( '' );
	} );
} );
