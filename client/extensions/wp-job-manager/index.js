/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import Main from 'components/main';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

import { makeLayout, render as clientRender } from 'controller';

const render = (context, next) => {
    context.primary = <Main className="wp-job-manager__main">
		<SectionHeader label="WP Job Manager" />
		<Card>
			<p>This is the start of something great!</p>
			<p>This will be the home for your WP Job Manager integration with WordPress.com.</p>
		</Card>
	</Main>;
	next();
};

export default function() {
	page(
	    '/extensions/wp-job-manager/:site?',
		siteSelection,
		navigation,
		render,
		makeLayout,
		clientRender
	);
}
