/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DropZone from 'components/drop-zone';

const DropZoneExample = localize(
	class extends React.PureComponent {
		state = {};

		onFilesDrop = ( files ) => {
			this.setState( {
				lastDroppedFiles: files,
			} );
		};

		renderContainerContent = () => {
			const style = {
				lineHeight: '100px',
				textAlign: 'center',
			};
			let fileNames;

			if ( this.state.lastDroppedFiles ) {
				fileNames = this.state.lastDroppedFiles
					.map( function ( file ) {
						return file.name;
					} )
					.join( ', ' );
			}

			return (
				<Card style={ style }>
					{ fileNames
						? this.props.translate( 'You dropped: %s', { args: fileNames } )
						: this.props.translate( 'This is a droppable area' ) }
				</Card>
			);
		};

		renderContainer = () => {
			const style = {
				position: 'relative',
				height: '150px',
			};

			return (
				<div style={ style }>
					{ this.renderContainerContent() }
					<DropZone onFilesDrop={ this.onFilesDrop } />
				</div>
			);
		};

		render() {
			return this.renderContainer();
		}
	}
);

DropZoneExample.displayName = 'DropZone';

export default DropZoneExample;
