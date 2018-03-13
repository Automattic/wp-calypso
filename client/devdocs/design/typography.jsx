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
			display: 'block',
			margin: '8px 0',
			fontSize: '24px',
			fontWeight: '300',
			lineHeight: '32px',
		};

		const interfaceSubtitle = {
			display: 'block',
			margin: '8px 0',
			fontSize: '21px',
			fontWeight: '300',
			lineHeight: '32px',
		};

		const interfaceBodyCopy = {
			display: 'block',
			margin: '8px 0',
			fontSize: '14px',
			fontWeight: '400',
			lineHeight: '1.5',
		};

		const interfaceLabel = {
			display: 'block',
			margin: '8px 0',
			fontSize: '13px',
			fontWeight: '600',
			lineHeight: '18px',
		};

		const interfaceCaption = {
			display: 'block',
			margin: '8px 0',
			fontSize: '11px',
			fontWeight: '400',
			lineHeight: '16px',
			textTransform: 'uppercase',
		};

		const contentTitle = {
			display: 'block',
			margin: '8px 0',
			fontFamily: 'Noto Serif',
			fontSize: '32px',
			fontWeight: '700',
			lineHeight: '40px',
		};

		const contentSubtitle = {
			display: 'block',
			margin: '8px 0',
			fontFamily: 'Noto Serif',
			fontSize: '24px',
			fontWeight: '700',
			lineHeight: '32px',
		};

		const contentBodyCopy = {
			display: 'block',
			margin: '8px 0',
			fontFamily: 'Noto Serif',
			fontSize: '16px',
			fontWeight: '400',
			lineHeight: '1.5',
		};

		return (
			<Main className="devdocs devdocs__typography">
				<DocumentHead title="Typography" />

				<div className="devdocs__doc-content">
					<h1>Typography</h1>
					<h2>Interface Typography</h2>

					<p>
						We use system fonts which improve the page rendering speed.<br />
						<code>
							-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu",
							"Cantarell", "Helvetica Neue", sans-serif
						</code>
					</p>

					<Card>
						<span style={ interfaceTitle }>Quick foxes jump nightly above wizards.</span>
						<span style={ interfaceSubtitle }>Pack my box with five dozen liquor jugs</span>
						<span style={ interfaceBodyCopy }>
							“A man who would letterspace lower case would steal sheep,” Frederic Goudy liked to
							say. The reason for not letterspacing lower case is that it hampers legibility. But
							there are some lowercase alphabets to which…
						</span>
						<span style={ interfaceLabel }>Site description</span>
						<span style={ interfaceCaption }>Views per page</span>
					</Card>

					<h2>Content Typography</h2>
					<p>
						We use <code>Noto Serif</code> which helps to make the web more beautiful across
						platforms for all languages.
					</p>

					<Card>
						<span style={ contentTitle }>Quick foxes jump nightly above wizards.</span>
						<span style={ contentSubtitle }>Pack my box with five dozen liquor jugs</span>
						<span style={ contentBodyCopy }>
							“A man who would letterspace lower case would steal sheep,” Frederic Goudy liked to
							say. The reason for not letterspacing lower case is that it hampers legibility. But
							there are some lowercase alphabets to which…
						</span>
					</Card>
				</div>
			</Main>
		);
	}
}
