/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';

export default React.createClass( {
	displayName: 'Typography',

	mixins: [ PureRenderMixin ],

	render() {
		const interfaceTitle = {
			fontSize: '24px',
			fontWeight: '300',
			lineHeight: '32px'
		};

		const interfaceSubtitle = {
			fontSize: '21px',
			fontWeight: '300',
			lineHeight: '32px'
		};

		const interfaceBodyCopy = {
			fontSize: '14px',
			fontWeight: '400',
			lineHeight: '1.5'
		};

		const interfaceLabel = {
			fontSize: '13px',
			fontWeight: '600',
			lineHeight: '18px'
		};

		const interfaceCaption = {
			fontSize: '11px',
			fontWeight: '400',
			lineHeight: '16px',
			textTransform: 'uppercase'
		};

		const contentTitle = {
			fontFamily: 'Merriweather',
			fontSize: '32px',
			fontWeight: '700',
			lineHeight: '40px'
		};

		const contentSubtitle = {
			fontFamily: 'Merriweather',
			fontSize: '24px',
			fontWeight: '700',
			lineHeight: '32px'
		};

		const contentBodyCopy = {
			fontFamily: 'Merriweather',
			fontSize: '16px',
			fontWeight: '400',
			lineHeight: '1.5'
		};

		return (
			<Main className="design">
				<div className="docs__design-group">
					<h2>
						<a href="/devdocs/design/typography">Typography</a>
					</h2>
					<h3>Interface Typography</h3>
					<Card>
						<p style={ interfaceTitle }>Quick foxes jump nightly above wizards.</p>
						<p style={ interfaceSubtitle }>Pack my box with five dozen liquor jugs</p>
						<p style={ interfaceBodyCopy }>“A man who would letterspace lower case would steal sheep,” Frederic Goudy liked to say. The reason for not letterspacing lower case is that it hampers legibility. But there are some lowercase alphabets to which…</p>
						<p style={ interfaceLabel }>Site description</p>
						<p style={ interfaceCaption }>Views per page</p>
					</Card>
					<h3>Content Typography</h3>
					<Card>
						<p style={ contentTitle }>Quick foxes jump nightly above wizards.</p>
						<p style={ contentSubtitle }>Pack my box with five dozen liquor jugs</p>
						<p style={ contentBodyCopy }>“A man who would letterspace lower case would steal sheep,” Frederic Goudy liked to say. The reason for not letterspacing lower case is that it hampers legibility. But there are some lowercase alphabets to which…</p>
					</Card>
				</div>
			</Main>
		);
	}
} );
