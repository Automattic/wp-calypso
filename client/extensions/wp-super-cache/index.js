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
		<Main className="wp-super-cache__main">
			<SectionHeader label="WP Super Cache" />
			<Card>
				<p>This will be the home for your WP Super Cache integration with WordPress.com.</p>
			</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/wp-super-cache/:site?', siteSelection, navigation, render );
}
