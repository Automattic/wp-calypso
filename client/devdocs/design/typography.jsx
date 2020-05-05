/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
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
						We use sans-serif system fonts with weights of 400 or greater as the default for UI.
						This includes UI elements like buttons, notices, and navigation. System fonts improve
						the page-rendering speed.
					</p>
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
						The <code>$sans</code> Sass variable will output the sans-serif font stack.
					</p>

					<pre>
						<code>
							.design__typography-sans &#123;
							{ '\n\t' }
							font-family: $sans;
							{ '\n\t' }
							font-size: 16px;
							{ '\n\t' }
							font-weight: 400;
							{ '\n\t' }
							color: var( --color-neutral-70 );
							{ '\n' }
							&#125;
						</code>
					</pre>

					<h2>Content Typography</h2>
					<p>
						We mostly use <code>Noto Serif</code> with weights of 400 or greater in reading and
						writing contexts, like the Reader and the editor. Use your best judgment when using Noto
						Serif for a UI element. Does it add valuable context for the person using our products?
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
						The <code>$serif</code> Sass variable will output the serif font stack.
					</p>

					<pre>
						<code>
							.design__typography-serif &#123;
							{ '\n\t' }
							font-family: $serif;
							{ '\n' }
							&#125;
						</code>
					</pre>

					<h2>Code Typography</h2>

					<p>We use monospace fonts for code blocks, sized at 15px.</p>
					<p>
						<code>
							Monaco, Consolas, "Andale Mono", "DejaVu Sans Mono", "Courier 10 Pitch", Courier,
							monospace
						</code>
					</p>

					<h3>How to use:</h3>

					<p>
						The <code>$code</code> Sass variable will output the monospaced font stack.
					</p>

					<pre>
						<code>
							.design__typography-code &#123;
							{ '\n\t' }
							font-family: $code;
							{ '\n\t' }
							font-size: 15px;
							{ '\n' }
							&#125;
						</code>
					</pre>

					<h2>Typographic Modular Scale</h2>

					<p>
						A harmonic ratio helps in creating a more harmonious design. If we use the same scale
						across WordPress.com, things feel more cohesive — it’s as much about consistency as it
						is about harmony. Instead of using arbitrary numbers, we conform to a harmonic scale.
					</p>

					<p>
						We use a double-stranded Perfect Fifth scale, based on the ideal text size of 16px and a
						secondary important number of 14px. We round the values to the nearest pixel for ease of
						use. That gives us the following scale:
					</p>

					<table className="design__typography-modular-scale">
						<tbody>
							<tr>
								<th>Pixels</th>
								<th>Ems</th>
							</tr>
							<tr>
								<td>54</td>
								<td>3.375</td>
							</tr>
							<tr>
								<td>47</td>
								<td>2.953</td>
							</tr>
							<tr>
								<td>36</td>
								<td>2.25</td>
							</tr>
							<tr>
								<td>32</td>
								<td>1.969</td>
							</tr>
							<tr>
								<td>24</td>
								<td>1.5</td>
							</tr>
							<tr>
								<td>21</td>
								<td>1.313</td>
							</tr>
							<tr>
								<td>16</td>
								<td>1</td>
							</tr>
							<tr>
								<td>14</td>
								<td>0.875</td>
							</tr>
							<tr>
								<td>11</td>
								<td>0.667</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Main>
		);
	}
}
