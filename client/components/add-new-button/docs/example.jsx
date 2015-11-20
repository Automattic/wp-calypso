/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var AddNewButton = require( 'components/add-new-button' );

var AddNewButtons = React.createClass( {
	displayName: 'AddNewButton',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/add-new-button">Add New Buttons</a>
				</h2>
				<AddNewButton>Unstyled Add New Button</AddNewButton>
				<AddNewButton href="#" outline={true}> Link-styled with outline</AddNewButton>
				<hr />
				<AddNewButton icon="plugins">Install Button</AddNewButton>
				<AddNewButton href="#" icon="pages">Link</AddNewButton>
				<AddNewButton href="#" icon="user">Link</AddNewButton>
				<AddNewButton href="#" icon="tag">Link</AddNewButton>
			</div>
		);
	}
} );

module.exports = AddNewButtons;
