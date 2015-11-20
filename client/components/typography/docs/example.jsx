/**
 * External dependencies
 */
var React = require( 'react' ),
	Card = require( 'components/card/index' );

var Buttons = React.createClass( {
	displayName: 'Typography',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		var interfaceTitle = {
			fontSize: '24px',
			fontWeight: '300',
			lineHeight: '32px'
		};

		var interfaceSubtitle = {
			fontSize: '21px',
			fontWeight: '300',
			lineHeight: '32px'
		};

		var interfaceBodyCopy = {
			fontSize: '14px',
			fontWeight: '400',
			lineHeight: '1.5'
		};

		var interfaceLabel = {
			fontSize: '13px',
			fontWeight: '600',
			lineHeight: '18px'
		};

		var interfaceCaption = {
			fontSize: '11px',
			fontWeight: '400',
			lineHeight: '16px',
			textTransform: 'uppercase'
		};

		var contentTitle = {
			fontFamily: 'Merriweather',
			fontSize: '32px',
			fontWeight: '700',
			lineHeight: '40px'
		};

		var contentSubtitle = {
			fontFamily: 'Merriweather',
			fontSize: '24px',
			fontWeight: '700',
			lineHeight: '32px'
		};

		var contentBodyCopy = {
			fontFamily: 'Merriweather',
			fontSize: '16px',
			fontWeight: '400',
			lineHeight: '1.5'
		};

		return (
			<div className="design-assets__group">
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
		);
	}
} );

module.exports = Buttons;
