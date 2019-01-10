/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Component } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const withVideoPressEdit = createHigherOrderComponent( CoreVideoEdit => {
	return class VideoPressEdit extends Component {
		setAttributes = async attributes => {
			const { id } = attributes;

			if ( id ) {
				const media = await apiFetch( {
					path: `/rest/v1.1/media/${ id }`,
				} );
				if ( media.videopress_guid ) {
					const videoPressData = await apiFetch( {
						path: `/rest/v1.1/videos/${ media.videopress_guid }`,
						addSiteSlug: false,
					} );
					attributes.src = `${ videoPressData.file_url_base.https }${
						videoPressData.files.hd.mp4
					}`;
				}
			}
			this.props.setAttributes( attributes );
		};

		render() {
			return <CoreVideoEdit { ...this.props } setAttributes={ this.setAttributes } />;
		}
	};
}, 'withVideoPressEdit' );

export default withVideoPressEdit;
