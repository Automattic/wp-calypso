/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { WordPressPrereleaseNotice } from '../notice';
import type { Site, WordPressPrerelease } from '@automattic/api-core';

const site = { ID: 123, slug: 'test-site.wordpress.com' } as Site;

const prerelease: WordPressPrerelease = {
	auto_enrolled: true,
	version: '7.2-beta2',
	release_date: '2026-12-08',
};

describe( '<WordPressPrereleaseNotice>', () => {
	test( 'names the pre-release and its release date, and links to the WordPress settings', async () => {
		render(
			<WordPressPrereleaseNotice
				site={ site }
				prerelease={ prerelease }
				recordTracksEvent={ jest.fn() }
			/>
		);

		expect(
			await screen.findByText(
				'Your site is running WordPress 7.2 Beta as part of early access. If you’d rather wait for the December 8 release, you can switch back.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Learn more' } ) ).toHaveAttribute(
			'href',
			'/sites/test-site.wordpress.com/settings/wordpress'
		);
	} );

	test( 'names a release candidate RC', async () => {
		render(
			<WordPressPrereleaseNotice
				site={ site }
				prerelease={ { ...prerelease, version: '7.2-RC1' } }
				recordTracksEvent={ jest.fn() }
			/>
		);

		expect(
			await screen.findByText( /Your site is running WordPress 7\.2 RC as part of early access\./ )
		).toBeVisible();
	} );

	test( 'saves the release it was dismissed for', async () => {
		const user = userEvent.setup();
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				expect( body ).toEqual( {
					calypso_preferences: { 'hosting-dashboard-wp-prerelease-notice-dismissed-123': '7.2' },
				} );
				return true;
			} )
			.reply( 200, { calypso_preferences: {} } );

		render(
			<WordPressPrereleaseNotice
				site={ site }
				prerelease={ prerelease }
				recordTracksEvent={ jest.fn() }
			/>
		);

		await user.click( await screen.findByRole( 'button', { name: 'Dismiss' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );
} );
