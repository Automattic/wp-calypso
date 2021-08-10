import { Card } from '@automattic/components';
import page from 'page';
import React from 'react';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';

const render = ( context, next ) => {
	context.primary = (
		<Main className="sensei__main">
			<SectionHeader label="Sensei LMS" />
			<Card>
				<p>This is the start of something great!</p>
				<p>This will be the home for your Sensei integration with WordPress.com.</p>
			</Card>
		</Main>
	);
	next();
};

export default function () {
	page( '/extensions/sensei/:site?', siteSelection, navigation, render, makeLayout, clientRender );
}
