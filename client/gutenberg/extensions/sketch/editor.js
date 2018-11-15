/** @format */

/**
 * External dependencies
 */
import React from 'react';
import apiFetch from '@wordpress/api-fetch';
import { registerBlockType } from '@wordpress/blocks';
import { Component } from '@wordpress/element';
import { InspectorControls, PanelColorSettings, mediaUpload } from '@wordpress/editor';

function dataURItoBlob( dataURI ) {
	const byteString = atob( dataURI.split( ',' )[ 1 ] );
	const mimeString = dataURI
		.split( ',' )[ 0 ]
		.split( ':' )[ 1 ]
		.split( ';' )[ 0 ];
	const ab = new ArrayBuffer( byteString.length );
	const ia = new Uint8Array( ab );
	for ( let i = 0; i < byteString.length; i++ ) {
		ia[ i ] = byteString.charCodeAt( i );
	}
	return new Blob( [ ab ], { type: mimeString } );
}

class Doodleboard extends Component {
	constructor( ...args ) {
		super( ...args );

		this.xs = [];
		this.ys = [];
		this.cs = [];
		this.rs = [];
		this.canvas = React.createRef();
	}

	addClick = ( x, y, c ) => {
		this.xs.push( x );
		this.ys.push( y );
		this.cs.push( c );
		this.rs.push( this.props.attributes.color || '#df4b26' );
	};

	draw = () => {
		const c = this.canvas.current.getContext( '2d' );

		c.clearRect( 0, 0, c.canvas.width, c.canvas.height );

		c.lineJoin = 'round';
		c.lineWidth = 5;

		const xs = this.xs;
		const ys = this.ys;
		const cs = this.cs;
		const rs = this.rs;

		for ( let i = 0; i < xs.length; i++ ) {
			c.beginPath();
			if ( cs[ i ] && i ) {
				c.moveTo( xs[ i - 1 ], ys[ i - 1 ] );
			} else {
				c.moveTo( xs[ i ] - 1, ys[ i ] );
			}
			c.lineTo( xs[ i ], ys[ i ] );
			c.closePath();
			c.strokeStyle = rs[ i ];
			c.stroke();
		}
	};

	mouseDown = ( { clientX, clientY } ) => {
		const c = this.canvas.current;
		const { left, top } = c.getBoundingClientRect();
		const x = clientX - left;
		const y = clientY - top;

		this.isDrawing = true;
		this.addClick( x, y );
		this.draw();
	};

	mouseMove = ( { clientX, clientY } ) => {
		if ( ! this.isDrawing ) {
			return;
		}

		const c = this.canvas.current;
		const { left, top } = c.getBoundingClientRect();
		const x = clientX - left;
		const y = clientY - top;

		this.addClick( x, y, true );
		this.draw();
	};

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

		this.props.setAttributes( { isUploading: true } );
		mediaUpload( {
			filesList: [ dataURItoBlob( data ) ],
			allowedTypes: [ 'image' ],
			onFileChange: ( [ image ] ) => {
				this.props.setAttributes( { isUploading: false, mediaId: image.id, url: image.url } );
			},
		} );
	};

	render() {
		const { attributes, className, isSelected } = this.props;

		if ( ! isSelected || attributes.isUploading ) {
			return <img className={ className } src={ attributes.url } alt="Doodle" />;
		}

		return (
			<div>
				<InspectorControls>
					<PanelColorSettings
						title={ 'Brush Settings' }
						initialOpen={ false }
						colorSettings={ [
							{
								value: attributes.color || '#df4b26',
								onChange: color => this.props.setAttributes( { color } ),
								label: 'Color',
							},
						] }
					/>
				</InspectorControls>
				<canvas
					ref={ this.canvas }
					className={ className }
					width="400"
					height="400"
					onMouseDown={ this.mouseDown }
					onMouseMove={ this.mouseMove }
					onMouseUp={ this.stopDrawing }
					onMouseLeave={ this.stopDrawing }
				/>
			</div>
		);
	}
}

const edit = Doodleboard;

const save = ( { attributes, className } ) => (
	<img className={ className } src={ attributes.url } alt="Doodle" />
);

registerBlockType( 'a8c/sketch', {
	title: 'Sketch a doodle',
	icon: 'admin-customizer',
	category: 'common',
	attributes: {
		mediaId: {
			type: 'number',
		},
		url: {
			type: 'string',
			source: 'attribute',
			selector: 'img',
			attribute: 'src',
		},
	},
	edit,
	save,
} );
