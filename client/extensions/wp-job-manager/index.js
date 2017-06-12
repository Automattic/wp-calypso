/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

const render = ( context ) => {
	renderWithReduxStore( (
		<Main className="wp-job-manager__main">
			<SectionHeader label="WP Job Manager" />
			<Card>
				<p>This is the start of something great!</p>
				<p>This will be the home for your WP Job Manager integration with WordPress.com.</p>
			</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/extensions/wp-job-manager/:site?', siteSelection, navigation, render );
}
