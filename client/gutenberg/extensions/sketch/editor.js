/** @format */
/**
 * External dependencies
 */
import React from 'react';
import apiFetch from '@wordpress/api-fetch';
import { registerBlockType } from '@wordpress/blocks';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls, mediaUpload, PanelColorSettings } from '@wordpress/editor';

function dataURItoBlob( dataURI ) {
	const byteString = atob( dataURI.split( ',' )[ 1 ] );
	const ab = new ArrayBuffer( byteString.length );
	const ia = new Uint8Array( ab );
	for ( let i = 0; i < byteString.length; i++ ) {
		ia[ i ] = byteString.charCodeAt( i );
	}
	return new Blob( [ ab ], { type: 'image/png' } );
}

const save = ( { attributes, className } ) => (
	<img className={ className } src={ attributes.url } alt="Doodle" />
);

class Doodleboard extends Component {
	constructor( ...args ) {
		super( ...args );

		this.points = [];
		this.canvas = React.createRef();
	}

	addClick = ( x, y, c ) =>
		this.points.push( [ x, y, c, this.props.attributes.color || '#0087be' ] );

	draw = () => {
		const c = this.canvas.current.getContext( '2d' );

		c.clearRect( 0, 0, c.canvas.width, c.canvas.height );
		c.lineJoin = 'round';
		c.lineWidth = 5;

		for ( let i = 0; i < this.points.length; i++ ) {
			const next = this.points[ i ];
			const prev = this.points[ i - 1 ];

			c.beginPath();
			if ( next[ 2 ] && i ) {
				c.moveTo( prev[ 0 ], prev[ 1 ] );
			} else {
				c.moveTo( next[ 0 ] - 1, next[ 1 ] );
			}
			c.lineTo( next[ 0 ], next[ 1 ] );
			c.closePath();
			c.strokeStyle = next[ 3 ];
			c.stroke();
		}
	};

	mouseDown = ( { clientX, clientY, isConnected = false } ) => {
		const { left, top } = this.canvas.current.getBoundingClientRect();
		this.isDrawing = true;
		this.addClick( clientX - left, clientY - top, isConnected );
		this.draw();
	};

	mouseMove = ( { clientX, clientY } ) =>
		this.isDrawing && this.mouseDown( { clientX, clientY, isConnected: true } );

	stopDrawing = () => {
		this.isDrawing = false;
		const data = this.canvas.current.toDataURL( 'image/png' );

		if ( this.props.attributes.mediaId ) {
			apiFetch( {
				path: `/wp/v2/media/${ this.props.attributes.mediaId }?force=true`,
				method: 'DELETE',
			} );
			this.props.setAttributes( { mediaId: undefined } );
		}

		mediaUpload( {
			filesList: [ dataURItoBlob( data ) ],
			allowedTypes: [ 'image' ],
			onFileChange: ( [ image ] ) => {
				this.props.setAttributes( { mediaId: image.id, url: image.url } );
			},
		} );
	};

	render() {
		return ! this.props.isSelected ? (
			save( this.props )
		) : (
			<Fragment>
				<InspectorControls>
					<PanelColorSettings
						title={ 'Brush Settings' }
						initialOpen={ false }
						colorSettings={ [
							{
								value: this.props.attributes.color || '#0087be',
								onChange: color => this.props.setAttributes( { color } ),
								label: 'Color',
							},
						] }
					/>
				</InspectorControls>
				<canvas
					ref={ this.canvas }
					className={ this.props.className }
					style={ { border: '2px solid #0087be' } }
					width="400"
					height="400"
					onMouseDown={ this.mouseDown }
					onMouseMove={ this.mouseMove }
					onMouseUp={ this.stopDrawing }
					onMouseLeave={ this.stopDrawing }
				/>
			</Fragment>
		);
	}
}

const edit = Doodleboard;

registerBlockType( 'a8c/sketch', {
	title: 'Sketch a doodle',
	icon: 'admin-customizer',
	category: 'common',
	attributes: {
		mediaId: { type: 'number' },
		url: { type: 'string', source: 'attribute', selector: 'img', attribute: 'src' },
	},
	edit,
	save,
} );
