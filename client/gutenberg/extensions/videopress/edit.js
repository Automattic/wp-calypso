/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import getVideoPressUrl from './get-videopress-url';

const debug = debugFactory( 'extensions:gutenberg:videopress' );

const withVideoPressEdit = createHigherOrderComponent( CoreVideoEdit => {
	return class VideoPressEdit extends Component {
		setAttributes = attributes => {
			const { id, src } = attributes;
			const { id: currentId } = this.props.attributes;
			let shouldSetSrcFromVideoPress = false;

			if ( id && id !== currentId ) {
				shouldSetSrcFromVideoPress = true;

				this.setSrcFromVideoPress( id ).catch( error => {
					// If fails, fallback to the original src attribute
					this.props.setAttributes( { src } );

					switch ( error.message ) {
						case 'changed_video_id':
							return debug(
								'video id was changed in the editor while fetching data for the previous video id'
							);

						case 'missing_videopress_data':
							return debug( `no VideoPress video information found for media id ${ id }` );

						default:
							return debug( `Unexpected problem getting VideoPress data: ${ error.message }` );
					}
				} );
			}

			// Strip out the src attribute if we're setting it from VideoPress
			return this.props.setAttributes( {
				...attributes,
				src: shouldSetSrcFromVideoPress ? '' : src,
			} );
		};

		setSrcFromVideoPress = async videoId => {
			const videoPressUrl = await getVideoPressUrl( videoId );

			if ( ! videoPressUrl ) {
				throw new Error( 'missing_videopress_data' );
			}

			const { id: currentId } = this.props.attributes;
			if ( videoId && videoId !== currentId ) {
				throw new Error( 'changed_video_id' );
			}

			this.props.setAttributes( {
				src: videoPressUrl,
			} );
		};

		render() {
			return <CoreVideoEdit { ...this.props } setAttributes={ this.setAttributes } />;
		}
	};
}, 'withVideoPressEdit' );

export default withVideoPressEdit;
