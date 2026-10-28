/**
 * @jest-environment jsdom
 */
import { setLocale } from '@automattic/number-formatters';
import { screen } from '@testing-library/react';
import { resetLocaleData, setLocaleData } from '@wordpress/i18n';
import { render } from '../../../test-utils';
import ContentInfo from '../content-info';
import type { SiteResetContentSummary } from '@automattic/api-core';

const emptyContent: SiteResetContentSummary = {
	post_count: 0,
	page_count: 0,
	media_count: 0,
	plugin_count: 0,
};

beforeEach( () => {
	setLocale( 'en' );
	resetLocaleData();
} );

afterEach( () => {
	setLocale( 'en' );
	resetLocaleData();
} );

describe( '<ContentInfo>', () => {
	test( 'uses singular labels for one of each content type', async () => {
		render(
			<ContentInfo
				siteDomain="example.com"
				siteContent={ { post_count: 1, page_count: 1, media_count: 1, plugin_count: 1 } }
			/>
		);

		for ( const name of [ '1 post', '1 page', '1 media item', '1 plugin' ] ) {
			expect( await screen.findByRole( 'link', { name } ) ).toBeVisible();
		}
	} );

	test( 'formats large counts with plural labels', async () => {
		render(
			<ContentInfo
				siteDomain="example.com"
				siteContent={ {
					post_count: 1234567,
					page_count: 12345,
					media_count: 2345678,
					plugin_count: 1234,
				} }
			/>
		);

		for ( const name of [
			'1,234,567 posts',
			'12,345 pages',
			'2,345,678 media items',
			'1,234 plugins',
		] ) {
			expect( await screen.findByRole( 'link', { name } ) ).toBeVisible();
		}
	} );

	test( 'omits content types with zero counts', async () => {
		render(
			<ContentInfo siteDomain="example.com" siteContent={ { ...emptyContent, page_count: 1 } } />
		);

		expect( await screen.findByRole( 'link', { name: '1 page' } ) ).toBeVisible();
		expect( screen.getAllByRole( 'link' ) ).toHaveLength( 1 );
	} );

	test( 'translates complete labels using each content type’s plural forms', async () => {
		setLocale( 'de' );
		setLocaleData( {
			'': { lang: 'de', 'plural-forms': 'nplurals=2; plural=(n != 1);' },
			'%s post': [ '%s Beitrag', '%s Beiträge' ],
			'%s page': [ '%s Seite', '%s Seiten' ],
			'%s media item': [ '%s Medium', '%s Medien' ],
			'%s plugin': [ '%s Plugin', '%s Plugins' ],
		} );
		render(
			<ContentInfo
				siteDomain="example.com"
				siteContent={ { post_count: 1, page_count: 2, media_count: 1234, plugin_count: 1 } }
			/>
		);

		for ( const name of [ '1 Beitrag', '2 Seiten', '1.234 Medien', '1 Plugin' ] ) {
			expect( await screen.findByRole( 'link', { name } ) ).toBeVisible();
		}
	} );
} );
