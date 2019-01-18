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
import { getVideoPressUrl, isVideoPressUrl } from './utils';

const debug = debugFactory( 'extensions:gutenberg:videopress' );

const withVideoPressEdit = createHigherOrderComponent( CoreVideoEdit => {
	return class VideoPressEdit extends Component {
		setAttributes = attributes => {
			const { id, src } = attributes;
			const { id: currentId } = this.props.attributes;

			const result = this.props.setAttributes( attributes );

			if ( id && id !== currentId && ! isVideoPressUrl( src ) ) {
				this.setSrcFromVideoPress( id );
			}

			return result;
		};

		setSrcFromVideoPress = async id => {
			const videoPressUrl = await getVideoPressUrl( id );

			if ( ! videoPressUrl ) {
				debug( `no VideoPress data found for video ${ id }` );
				return;
			}

			const { id: currentId } = this.props.attributes;
			if ( id && id !== currentId ) {
				debug( 'video was changed in the editor while fetching data for the previous video' );
				return;
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
