/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';

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
							font-size: $font-body;
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
						writing contexts, like the Reader. Use your best judgment when using Noto Serif for a UI
						element. Does it add valuable context for the person using our products?
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

					<h2>Brand Typography</h2>

					<p>
						We use Recoleta sparingly to add our brand's flavor to select headings. In general,
						Recoleta should be used for main page titles (linked from the main sidebar navigation)
						and no more than one main heading per page. It looks best at sizes 24px or greater, or{ ' ' }
						<code>$font-title-medium</code> in our type scale.
					</p>

					<p>Recoleta should not be used for UI elements, such as buttons or navigation.</p>

					<p>
						Since Recoleta is not compatible with some languages, we use a special class that
						targets specific locales, and falls back to the <code>$serif</code> stack when
						necessary.
					</p>

					<Card className="design__typography-brand-example">
						<h2>Quick foxes jump nightly above wizards.</h2>
						<h3>Pack my box with five dozen liquor jugs</h3>
					</Card>

					<h3>How to use:</h3>

					<p>
						Extend the <code>.wp-brand-font</code> selector in your SCSS:
					</p>

					<pre>
						<code>
							.design__typography-branded &#123;
							{ '\n\t' }
							@extend .wp-brand-font;
							{ '\n\t' }
							font-size: $font-title-medium;
							{ '\n' }
							&#125;
						</code>
					</pre>

					<p>Or add the class directly to the element on which you want the brand font to show:</p>

					<pre>
						<code>&#60;h1 className="wp-brand-font"&#62;Branded heading&#60;/h1&#62;</code>
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
							font-size: $font-code;
							{ '\n' }
							&#125;
						</code>
					</pre>

					<h2>Typographic Scale</h2>

					<p>
						A harmonic ratio helps in creating a more harmonious design. If we use the same scale
						across WordPress.com, things feel more cohesive — it’s as much about consistency as it
						is about harmony. Instead of using arbitrary numbers, we conform to the WordPress core
						typescale.
					</p>

					<h3>How to use:</h3>

					<p>
						The following variables adhere to the type scale and save you from having to calculate
						the corresponding ems or rems:
					</p>

					<table className="design__typography-modular-scale">
						<tbody>
							<tr>
								<th>Sass Variable</th>
								<th>Pixels</th>
								<th>Rems</th>
							</tr>
							<tr>
								<td>
									<code>$font-headline-large</code>
								</td>
								<td>54</td>
								<td>3.375</td>
							</tr>
							<tr>
								<td>
									<code>$font-headline-medium</code>
								</td>
								<td>48</td>
								<td>3</td>
							</tr>
							<tr>
								<td>
									<code>$font-headline-small</code>
								</td>
								<td>36</td>
								<td>2.25</td>
							</tr>
							<tr>
								<td>
									<code>$font-title-large</code>
								</td>
								<td>32</td>
								<td>2</td>
							</tr>
							<tr>
								<td>
									<code>$font-title-medium</code>
								</td>
								<td>24</td>
								<td>1.5</td>
							</tr>
							<tr>
								<td>
									<code>$font-title-small</code>
								</td>
								<td>20</td>
								<td>1.25</td>
							</tr>
							<tr>
								<td>
									<code>$font-body</code>
								</td>
								<td>16</td>
								<td>1</td>
							</tr>
							<tr>
								<td>
									<code>$font-body-small</code>
								</td>
								<td>14</td>
								<td>0.875</td>
							</tr>
							<tr>
								<td>
									<code>$font-body-extra-small</code>
								</td>
								<td>12</td>
								<td>0.75</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Main>
		);
	}
}
