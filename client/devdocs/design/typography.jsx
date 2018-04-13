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

					<p>We use system fonts for UI elements. System fonts improve the page-rendering speed.</p>
					<p>
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

					<h3>How to use:</h3>

					<p>
						The <code>$sans</code> Sass variable will output the correct font stack.
					</p>

					<pre>
						<code className="lang-css">
							.design__typography-sans &#123;
							{ '\n\t' }font-family: $sans;
							{ '\n' }&#125;
						</code>
					</pre>

					<h2>Content Typography</h2>
					<p>
						We use <code>Noto Serif</code> for user-generated content, like post titles, post
						content, and sometimes comments. <code>Noto Serif</code> helps to make the web more
						beautiful across platforms for all languages.
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

					<h3>How to use:</h3>

					<p>
						The <code>$serif</code> Sass variable will output the correct font stack.
					</p>

					<pre>
						<code className="lang-css">
							.design__typography-serif &#123;
							{ '\n\t' }font-family: $serif;
							{ '\n' }&#125;
						</code>
					</pre>

					<h2>Code Typography</h2>

					<p>
						We use monospace fonts for code blocks, sized at <code>15px</code>.
					</p>
					<p>
						<code>
							Monaco, Consolas, "Andale Mono", "DejaVu Sans Mono", "Courier 10 Pitch", Courier,
							monospace
						</code>
					</p>

					<h3>How to use:</h3>

					<p>
						The <code>$code</code> Sass variable will output the correct font stack.
					</p>

					<pre>
						<code className="lang-css">
							.design__typography-code &#123;
							{ '\n\t' }font-family: $code;
							{ '\n\t' }font-size: 15px;
							{ '\n' }&#125;
						</code>
					</pre>

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
