/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DropZone from 'components/drop-zone';

export default React.createClass( {
	displayName: 'DropZoneExample',

	mixins: [ PureRenderMixin ],

	getInitialState() {
		return {};
	},

	onFilesDrop( files ) {
		this.setState( {
			lastDroppedFiles: files
		} );
	},

	renderContainerContent() {
		const style = {
			lineHeight: '100px',
			textAlign: 'center'
		};
		let fileNames;

		if ( this.state.lastDroppedFiles ) {
			fileNames = this.state.lastDroppedFiles.map( function( file ) {
				return file.name;
			} ).join( ', ' );
		}

		return (
			<Card style={ style }>
				{ fileNames
					? this.translate( 'You dropped: %s', { args: fileNames } )
					: this.translate( 'This is a droppable area' ) }
			</Card>
		);
	},

	renderContainer() {
		const style = {
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

	render() {
		return this.renderContainer();
	}
} );
