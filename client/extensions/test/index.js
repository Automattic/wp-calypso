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
import controller from './controller';

const render = ( context ) => {
	renderWithReduxStore( (
		<Main className="test_main">
			<SectionHeader label="Test LMS" />
			<Card>
				<p>This is the start of something great!</p>
				<p>This will be the home for your Sensei integration with WordPress.com.</p>
			</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/extensions/test/writing', controller.writingSettings );
	page( '/extensions/test/discussion', controller.discussionSettings );
	page( '/extensions/test/', controller.writingSettings );
}
