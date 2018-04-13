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
		return (
			<Main className="devdocs design__typography devdocs__typography">
				<DocumentHead title="Typography" />

				<div className="design__typography-content devdocs__doc-content">
					<h1>Typography</h1>
					<h2>Interface Typography</h2>

					<p>
						We use system fonts which improve the page rendering speed.<br />
						<code>
							-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu",
							"Cantarell", "Helvetica Neue", sans-serif
						</code>
					</p>

					<Card className="design__typography-interface-example">
						<h2>Quick foxes jump nightly above wizards.</h2>
						<h3>Pack my box with five dozen liquor jugs</h3>
						<p>
							“A man who would letterspace lower case would steal sheep,” Frederic Goudy liked to
							say. The reason for not letterspacing lower case is that it hampers legibility. But
							there are some lowercase alphabets to which…
						</p>
					</Card>

					<h2>Content Typography</h2>
					<p>
						We use <code>Noto Serif</code> which helps to make the web more beautiful across
						platforms for all languages.
					</p>

					<Card className="design__typography-content-example">
						<h2>Quick foxes jump nightly above wizards.</h2>
						<h3>Pack my box with five dozen liquor jugs</h3>
						<p>
							“A man who would letterspace lower case would steal sheep,” Frederic Goudy liked to
							say. The reason for not letterspacing lower case is that it hampers legibility. But
							there are some lowercase alphabets to which…
						</p>
					</Card>

					<h2>Code Typography</h2>

					<p>
						We use the following font stack for code blocks, sized at <code>15px</code>:<br />
						<code>
							Monaco, Consolas, "Andale Mono", "DejaVu Sans Mono", "Courier 10 Pitch", Courier,
							monospace
						</code>
					</p>

					<Card className="design__typography-code-example">
						<p>
							“A man who would letterspace lower case would steal sheep,” Frederic Goudy liked to
							say. The reason for not letterspacing lower case is that it hampers legibility. But
							there are some lowercase alphabets to which…
						</p>
					</Card>

					<h3>More resources</h3>

					<ul>
						<li>
							<a href="https://wordpress.com/design-handbook/typography#typography-modularscale">
								Typographic Modular Scale
							</a>
						</li>
					</ul>
				</div>
			</Main>
		);
	}
}
