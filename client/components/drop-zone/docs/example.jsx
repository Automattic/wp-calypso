/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	DropZone = require( 'components/drop-zone' );

module.exports = React.createClass( {
	displayName: 'DropZones',

	mixins: [ React.addons.PureRenderMixin ],

	getInitialState: function() {
		return {};
	},

	onFilesDrop: function( files ) {
		this.setState( {
			lastDroppedFiles: files
		} );
	},

	renderContainerContent: function() {
		var style = {
			lineHeight: '100px',
			textAlign: 'center'
		}, fileNames;

		if ( this.state.lastDroppedFiles ) {
			fileNames = this.state.lastDroppedFiles.map( function( file ) {
				return file.name;
			} ).join( ', ' );
		}

		return (
			<Card style={ style }>
				{ fileNames ?
					this.translate( 'You dropped: %s', { args: fileNames } ) :
					this.translate( 'This is a droppable area' ) }
			</Card>
		);
	},

	renderContainer: function() {
		var style = {
			position: 'relative',
			height: '150px'
		};

		return (
			<div style={ style }>
				{ this.renderContainerContent() }
				<DropZone onFilesDrop={ this.onFilesDrop } />
			</div>
		);
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/dropzones">DropZone</a>
				</h2>
				{ this.renderContainer() }
			</div>
		);
	}
} );
