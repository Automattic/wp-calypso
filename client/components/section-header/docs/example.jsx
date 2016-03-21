/**
* External dependencies
*/
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' );

var Cards = React.createClass( {
	displayName: 'SectionHeader',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/section-header">Section Header</a>
				</h2>

				<SectionHeader label={ this.translate( 'Team' ) } count={ 10 }>
					<Button compact primary>
						{ this.translate( 'Primary Action' ) }
					</Button>
					<Button compact>
						{ this.translate( 'Manage' ) }
					</Button>
					<Button
						compact
						onClick={ function() {
							alert( 'Clicked add button' );
						} }
					>
						{ this.translate( 'Add' ) }
					</Button>
				</SectionHeader>

				<h2>Clickable SectionHeader</h2>

				<SectionHeader label={ this.translate( 'Team' ) } count={ 10 } href="/devdocs/design/section-header">
				</SectionHeader>
			</div>
		);
	}
} );

module.exports = Cards;
