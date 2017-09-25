/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import SectionHeader from 'components/section-header';
import { renderWithReduxStore } from 'lib/react-helpers';
import { navigation, siteSelection } from 'my-sites/controller';

const render = ( context ) => {
	renderWithReduxStore( (
		<Main className="sensei__main">
			<SectionHeader label="Sensei LMS" />
			<Card>
				<p>This is the start of something great!</p>
				<p>This will be the home for your Sensei integration with WordPress.com.</p>
			</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/extensions/sensei/:site?', siteSelection, navigation, render );
}
