/**
 * External dependencies
 */
import { compose, createHigherOrderComponent } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Disabled, IconButton, SandBox, Toolbar } from '@wordpress/components';
import { BlockControls, RichText } from '@wordpress/editor';
import { isBlobURL } from '@wordpress/blob';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import Loading from './loading';

const withVideoPressEdit = CoreVideoEdit => props => {
	const {
		className,
		isFetchingPreview,
		isSelected,
		isUploading,
		setAttributes,
		videoPressPreview,
	} = props;

	if ( isFetchingPreview || isUploading ) {
		return (
			<div className="wp-block-jetpack-videopress">
				<Loading text={ isFetchingPreview ? __( 'Embedding…' ) : __( 'Uploading…' ) } />
			</div>
		);
	}

	if ( ! videoPressPreview ) {
		return <CoreVideoEdit { ...props } />;
	}

	const { html, scripts } = videoPressPreview;
	const { caption } = props.attributes;

	const switchToEditing = () => {
		setAttributes( {
			id: undefined,
			src: undefined,
		} );
	};

	return (
		<div className="wp-block-jetpack-videopress">
			<BlockControls>
				<Toolbar>
					<IconButton
						className="components-icon-button components-toolbar__control"
						label={ __( 'Edit video' ) }
						onClick={ switchToEditing }
						icon="edit"
					/>
				</Toolbar>
			</BlockControls>
			<figure className={ className }>
				{ /*
					Disable the video player so the user clicking on it won't play the
					video when the controls are enabled.
				*/ }
				<Disabled>
					<SandBox html={ html } scripts={ scripts } />
				</Disabled>
				{ ( ! RichText.isEmpty( caption ) || isSelected ) && (
					<RichText
						tagName="figcaption"
						placeholder={ __( 'Write caption…' ) }
						value={ caption }
						onChange={ value => setAttributes( { caption: value } ) }
						inlineToolbar
					/>
				) }
			</figure>
		</div>
	);
};

export default createHigherOrderComponent(
	compose( [
		withSelect( ( select, ownProps ) => {
			const { id, src } = ownProps.attributes;
			const { getEmbedPreview, getMedia, isRequestingEmbedPreview } = select( 'core' );

			const media = !! id && getMedia( id );
			const videoPressGuid = get( media, 'jetpack_videopress.guid' );
			const videoPressUrl = !! videoPressGuid && `https://videopress.com/v/${ videoPressGuid }`;
			const videoPressPreview = !! videoPressUrl && getEmbedPreview( videoPressUrl );

			const isFetchingMedia = !! id && ! media;
			const isFetchingEmbedPreview = !! videoPressUrl && isRequestingEmbedPreview( videoPressUrl );
			const isUploading = ! id && isBlobURL( src );

			return {
				isFetchingPreview: isFetchingMedia || isFetchingEmbedPreview,
				isUploading,
				videoPressPreview,
			};
		} ),
		withVideoPressEdit,
	] ),
	'withVideoPressEdit'
);
