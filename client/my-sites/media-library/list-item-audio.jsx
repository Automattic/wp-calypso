/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var ListItemFileDetails = require( './list-item-file-details' );

export default React.createClass( {
	displayName: 'MediaLibraryListItemDocument',

	render: function() {
		return <ListItemFileDetails { ...this.props } icon="audio" />;
	}
} );
