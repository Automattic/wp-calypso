/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';

export default class Typography extends React.PureComponent {
	static displayName = 'Typography';

	render() {
		const interfaceTitle = {
			fontSize: '24px',
			fontWeight: '300',
			lineHeight: '32px',
		};

		const interfaceSubtitle = {
			fontSize: '21px',
			fontWeight: '300',
			lineHeight: '32px',
		};

		const interfaceBodyCopy = {
			fontSize: '14px',
			fontWeight: '400',
			lineHeight: '1.5',
		};

		const interfaceLabel = {
			fontSize: '13px',
			fontWeight: '600',
			lineHeight: '18px',
		};

		const interfaceCaption = {
			fontSize: '11px',
			fontWeight: '400',
			lineHeight: '16px',
			textTransform: 'uppercase',
		};

		const contentTitle = {
			fontFamily: 'Noto Serif',
			fontSize: '32px',
			fontWeight: '700',
			lineHeight: '40px',
		};

		const contentSubtitle = {
			fontFamily: 'Noto Serif',
			fontSize: '24px',
			fontWeight: '700',
			lineHeight: '32px',
		};

		const contentBodyCopy = {
			fontFamily: 'Noto Serif',
			fontSize: '16px',
			fontWeight: '400',
			lineHeight: '1.5',
		};

		return (
			<Main className="design">
				<DocumentHead title="Typography" />

				<div className="docs__design-group">
					<h1>
						<a href="/devdocs/typography">Typography</a>
					</h1>
					<h2>Interface Typography</h2>
					<p>
						We use system fonts which improve the page rendering speed.<br />
						<code>
							-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu",
							"Cantarell", "Helvetica Neue", sans-serif
						</code>
					</p>
					<Card>
						<p style={ interfaceTitle }>Quick foxes jump nightly above wizards.</p>
						<p style={ interfaceSubtitle }>Pack my box with five dozen liquor jugs</p>
						<p style={ interfaceBodyCopy }>
							“A man who would letterspace lower case would steal sheep,” Frederic Goudy liked to
							say. The reason for not letterspacing lower case is that it hampers legibility. But
							there are some lowercase alphabets to which…
						</p>
						<p style={ interfaceLabel }>Site description</p>
						<p style={ interfaceCaption }>Views per page</p>
					</Card>
					<h2>Content Typography</h2>
					<p>
						We use <code>Noto Serif</code> which helps to make the web more beautiful across
						platforms for all languages.
					</p>
					<Card>
						<p style={ contentTitle }>Quick foxes jump nightly above wizards.</p>
						<p style={ contentSubtitle }>Pack my box with five dozen liquor jugs</p>
						<p style={ contentBodyCopy }>
							“A man who would letterspace lower case would steal sheep,” Frederic Goudy liked to
							say. The reason for not letterspacing lower case is that it hampers legibility. But
							there are some lowercase alphabets to which…
						</p>
					</Card>
				</div>
			</Main>
		);
	}
}
