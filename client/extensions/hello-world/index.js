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
import FAQ from 'components/faq';
import FAQItem from 'components/faq/faq-item';

const render = ( context ) => {
	renderWithReduxStore( (
		<Main>
			<SectionHeader label="Hello, World!">🌞</SectionHeader>
			<Card>
				<p>This section is the home for the <strong>Hello World</strong> extension.</p>
				<p>Extensions are setup to function in a semi-isolated environment, with their own url path and code chunk magic (using the power of Webpack) to assure code is loaded only when needed. Think of extensions as individual "apps" you can access in Calypso to interact with your plugin functionality in a focused way.</p>
			</Card>
			<FAQ>
				<FAQItem
					question="How can I get started?"
					answer={ [
						'If you are looking at writing your own extension head over to the "extensions" folder where we have a more comprehensive readme file to walk you through the process. ',
						<a href="https://github.com/Automattic/wp-calypso/tree/master/client/extensions" key="get-started">Get Started</a>
					] }
				/>
				<FAQItem
					question="Learning about Calypso"
					answer={ [
						'You can browse our docs without leaving the running application, just head over to the Devdocs section. You can also press the keys "gd" to navigate there from any page! ',
						<a href="https://github.com/Automattic/wp-calypso/tree/master/client/extensions" key="go-devdocs">Go to Devdocs</a>
					] }
				/>
				<FAQItem
					question="Have more questions?"
					answer="Head over to the GitHub repository for Calypso and open an issue."
				/>
			</FAQ>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/hello-world/:site?', siteSelection, navigation, render );
}
