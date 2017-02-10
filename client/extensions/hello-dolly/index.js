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
import { addReducer } from 'state';
import reducer from './state/reducer';

/**
 * Extension init
 */
// TODO: Maybe make this part of the extension load/unload code for all extensions?
addReducer( 'helloDolly', reducer );

const render = ( context ) => {
	renderWithReduxStore( (
		<Main className="hello-dolly__main">
			<SectionHeader label="Hello, Dolly!">🐑</SectionHeader>
			<Card>
				<p style={ { fontSize: 18, fontWeight: 300 } }>
					This is not just an extension, it symbolizes the hope and enthusiasm of an entire generation
					summed up in two words sung most famously by Louis Armstrong.
				</p>
				<hr />
				<p>This section is the home for the <strong>Hello Dolly</strong> extension.</p>
				<p>
					Extensions are set up to function in a semi-isolated environment,
					with their own URL path and code-chunk magic (using the power of webpack)
					to assure code is loaded only when needed. Think of extensions as
					individual "apps" you can access in Calypso to interact with your
					plugin functionality in a focused way.
				</p>
			</Card>
			<FAQ>
				<FAQItem
					question="How can I get started?"
					answer={ [
						'Head over to the "extensions" folder in the repository where we have a more comprehensive ',
						'README file to walk you through the process. ',
						<a href="https://github.com/Automattic/wp-calypso/tree/master/client/extensions" key="get-started">Get Started</a>
					] }
				/>
				<FAQItem
					question="Learning about Calypso"
					answer={ [
						'You can browse our docs without leaving the running application, just go to the Devdocs section. ',
						'Tip: press the keys "gd" to navigate there from any page! ',
						<a href="/devdocs" key="go-devdocs">Go to Devdocs</a>
					] }
				/>
				<FAQItem
					question="Have more questions?"
					answer={ [
						'Let\'s talk! Visit the ',
						<a href="https://github.com/Automattic/wp-calypso/" key="go-repo">Calypso GitHub repository</a>,
						' and open an issue.'
					] }
				/>
			</FAQ>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/hello-dolly/:site?', siteSelection, navigation, render );
}
