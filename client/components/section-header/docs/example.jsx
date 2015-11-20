/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var SectionHeader = require( 'components/section-header' ),
	SectionHeaderButton = require( 'components/section-header/button' ),
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
					<SectionHeaderButton>Manage</SectionHeaderButton>
					<SectionHeaderButton onClick={ function() {
						alert( 'Clicked add button' );
					} }>
						Add
					</SectionHeaderButton>
				</SectionHeader>

				<Card>
					Content here
				</Card>
			</div>
		);
	}
} );

module.exports = Cards;
