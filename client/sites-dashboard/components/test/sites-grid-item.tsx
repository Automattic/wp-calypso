/**
 * @jest-environment jsdom
 */
import React from 'react';
import renderer from 'react-test-renderer';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { SitesGridItem } from 'calypso/sites-dashboard/components/sites-grid-item';

function makeTestSite( { title = 'test', is_coming_soon = false, lang = 'en' } = {} ) {
	return {
		ID: 1,
		title,
		slug: 'test_slug',
		URL: '',
		launch_status: 'launched',
		options: {},
		jetpack: false,
		is_coming_soon,
		lang,
	};
}

describe( '<SitesGridItem>', () => {
	test( 'Default render', () => {
		const tree = renderer
			.create(
				<SitesGridItem site={ makeTestSite( { title: 'The example site' } ) as SiteExcerptData } />
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
