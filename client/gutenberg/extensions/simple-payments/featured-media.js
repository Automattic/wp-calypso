/** @format */

/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';
import { IconButton, Toolbar, ToolbarButton } from '@wordpress/components';
import { BlockControls, MediaPlaceholder, MediaUpload } from '@wordpress/editor';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const onSelectMedia = setAttributes => media =>
	setAttributes( { featuredMediaId: get( media, 'id', 0 ) } );

export default ( { featuredMedia, setAttributes } ) => {
	if ( ! featuredMedia ) {
		return (
			<MediaPlaceholder
				icon="format-image"
				labels={ {
					title: __( 'Product Image' ),
				} }
				accept="image/*"
				allowedTypes={ [ 'image' ] }
				onSelect={ onSelectMedia( setAttributes ) }
			/>
		);
	}

	return (
		<div>
			<Fragment>
				<BlockControls>
					<Toolbar>
						<MediaUpload
							onSelect={ onSelectMedia( setAttributes ) }
							allowedTypes={ [ 'image' ] }
							value={ featuredMedia.id }
							render={ ( { open } ) => (
								<IconButton
									className="components-toolbar__control"
									label={ __( 'Edit Image' ) }
									icon="edit"
									onClick={ open }
								/>
							) }
						/>
						<ToolbarButton
							icon={ 'trash' }
							title={ __( 'Remove Image' ) }
							onClick={ () => setAttributes( { featuredMediaId: null } ) }
						/>
					</Toolbar>
				</BlockControls>
				<figure>
					<img src={ featuredMedia.source_url } alt={ featuredMedia.alt_text } />
				</figure>
			</Fragment>
		</div>
	);
};
