/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { navigate } from 'calypso/lib/navigate';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PromptsNavigation from '../prompts-navigation';

jest.mock( 'calypso/lib/navigate', () => ( { navigate: jest.fn() } ) );

const PROMPT = {
	id: 1,
	text: 'What makes you feel at home?',
	answered_link: 'https://wordpress.com/tag/dailyprompt-1',
	answered_users_count: 0,
	answered_users_sample: [],
};

// Each fixture uses its own site ID: `isSimpleSite` is a memoized selector keyed
// on the site ID and only invalidated when `isJetpackSite` changes, so sharing
// one ID across tests can serve a stale answer to whichever test runs second.
const simpleSite = {
	ID: 1,
	URL: 'https://simple.wordpress.com',
	jetpack: false,
	options: { admin_url: 'https://simple.wordpress.com/wp-admin/' },
};

const atomicSite = {
	ID: 2,
	URL: 'https://atomic.blog',
	jetpack: true,
	is_wpcom_atomic: true,
	options: {
		admin_url: 'https://atomic.blog/wp-admin/',
		is_automated_transfer: true,
		is_wpcom_atomic: true,
	},
};

const selfHostedSite = {
	ID: 3,
	URL: 'https://selfhosted.blog',
	jetpack: true,
	options: { admin_url: 'https://selfhosted.blog/wp-admin/' },
};

const unhydratedSite = { ID: 4, name: 'Not loaded yet' };

const lateAtomicSite = {
	ID: 5,
	URL: 'https://atomic-later.blog',
	jetpack: true,
	is_wpcom_atomic: true,
	options: {
		admin_url: 'https://atomic-later.blog/wp-admin/',
		is_automated_transfer: true,
		is_wpcom_atomic: true,
	},
};

const renderCard = ( { site, siteId = site?.ID, canPublish = true, viewContext = 'home' } = {} ) =>
	renderWithProvider(
		<PromptsNavigation
			siteId={ siteId }
			prompts={ [ PROMPT ] }
			tracksPrefix="calypso_test_"
			viewContext={ viewContext }
		/>,
		{
			initialState: {
				sites: { items: site ? { [ site.ID ]: site } : {} },
				currentUser: {
					capabilities: site ? { [ site.ID ]: { publish_posts: canPublish } } : {},
				},
			},
		}
	);

const postAnswerLink = () => screen.getByRole( 'link', { name: /Post Answer/ } );

describe( 'PromptsNavigation "Post Answer" destination', () => {
	beforeEach( () => {
		navigate.mockClear();
	} );

	it( 'opens the Write editor on a Simple site', () => {
		renderCard( { site: simpleSite } );

		expect( postAnswerLink() ).toHaveAttribute(
			'href',
			'https://simple.wordpress.com/wp-admin/admin.php?page=write&answer_prompt=1&source=writing_prompt_home'
		);
	} );

	it( 'opens the Write editor on an Atomic site', () => {
		renderCard( { site: atomicSite } );

		expect( postAnswerLink() ).toHaveAttribute(
			'href',
			'https://atomic.blog/wp-admin/admin.php?page=write&answer_prompt=1&source=writing_prompt_home'
		);
	} );

	it( 'stays on the block editor for a self-hosted Jetpack site, which has no Write', () => {
		renderCard( { site: selfHostedSite } );

		expect( postAnswerLink() ).toHaveAttribute(
			'href',
			'https://selfhosted.blog/wp-admin/post-new.php?post_type=post&answer_prompt=1'
		);
	} );

	it( 'tags the Reader card so the editor can send the writer back there', () => {
		renderCard( { site: simpleSite, viewContext: 'reader' } );

		expect( postAnswerLink() ).toHaveAttribute(
			'href',
			'https://simple.wordpress.com/wp-admin/admin.php?page=write&answer_prompt=1&source=writing_prompt_reader'
		);
	} );

	it( 'stays on the block editor when the user cannot publish, since Write requires publish_posts', () => {
		renderCard( { site: simpleSite, canPublish: false } );

		expect( postAnswerLink() ).toHaveAttribute(
			'href',
			'https://simple.wordpress.com/wp-admin/post-new.php?post_type=post&answer_prompt=1'
		);
	} );

	it( 'keeps the prompt on the site picker when no site is chosen', () => {
		renderCard( { siteId: null } );

		expect( postAnswerLink() ).toHaveAttribute( 'href', '/post?answer_prompt=1' );
	} );

	it( 'keeps the prompt on the site picker before the site has loaded', () => {
		renderCard( { site: unhydratedSite } );

		expect( postAnswerLink() ).toHaveAttribute( 'href', '/post?answer_prompt=1' );
	} );

	it( 'navigates to the same destination the link points at', async () => {
		renderCard( { site: simpleSite } );

		await userEvent.click( screen.getByRole( 'link', { name: /Post Answer/ } ) );

		expect( navigate ).toHaveBeenCalledWith(
			'https://simple.wordpress.com/wp-admin/admin.php?page=write&answer_prompt=1&source=writing_prompt_home'
		);
	} );

	it( 'reaches Write on an Atomic site that loads after the card first rendered', () => {
		// `isWpcomSite` is memoized per site ID, and an Atomic site reads as
		// not-simple both before and after it lands in state. Without the site's
		// Atomic flag among the cache dependants, the pre-hydration `false` is
		// never invalidated and the card keeps pointing at the block editor.
		const firstPaint = renderCard( { site: null, siteId: lateAtomicSite.ID } );

		expect( postAnswerLink() ).toHaveAttribute( 'href', '/post?answer_prompt=1' );
		firstPaint.unmount();

		renderCard( { site: lateAtomicSite } );

		expect( postAnswerLink() ).toHaveAttribute(
			'href',
			'https://atomic-later.blog/wp-admin/admin.php?page=write&answer_prompt=1&source=writing_prompt_home'
		);
	} );
} );
