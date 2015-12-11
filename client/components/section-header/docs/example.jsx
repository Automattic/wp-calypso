/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' ),
	Card = require( 'components/card' );

var Cards = React.createClass( {
	displayName: 'SectionHeader',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/section-header">Section Header</a>
				</h2>

				<SectionHeader label="Team" count={ 10 }>
					<Button compact primary>
						Primary Action
					</Button>
					<Button compact>
						Manage
					</Button>
					<Button
						compact
						onClick={ function() {
							alert( 'Clicked add button' );
						} }
					>
						Add
					</Button>
				</SectionHeader>

				<Card>
					Content Here
				</Card>
			</div>
		);
	}
} );

module.exports = Cards;
