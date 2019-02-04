/**
 * External dependencies
 */
import { isBlobURL } from '@wordpress/blob';
import { compose, createHigherOrderComponent } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Disabled, IconButton, SandBox, Toolbar } from '@wordpress/components';
import { BlockControls, RichText } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import classnames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import Loading from './loading';
import { getClassNames, getVideoPressUrlFromGuid } from './util';

const VideoPressEdit = CoreVideoEdit =>
	class extends Component {
		componentDidUpdate( prevProps ) {
			const { setAttributes, guid } = this.props;
			if ( guid !== prevProps.guid ) {
				setAttributes( { guid } );
			}

			const hasPreview = undefined !== this.props.preview;
			const hadPreview = undefined !== prevProps.preview;
			const previewChanged =
				prevProps.preview &&
				this.props.preview &&
				this.props.preview.html !== prevProps.preview.html;
			const switchedPreview = previewChanged || ( hasPreview && ! hadPreview );
			if ( switchedPreview ) {
				this.setClasses();
			}
		}

		setClasses() {
			const { className } = this.props.attributes;
			const { html } = this.props.preview;
			this.props.setAttributes( {
				className: getClassNames( html, className ),
			} );
		}

		switchToEditing = () => {
			this.props.setAttributes( {
				id: undefined,
				src: undefined,
				videoPressGuid: undefined,
			} );
		};

		render() {
			const {
				attributes,
				className,
				isFetchingPreview,
				isSelected,
				isUploading,
				preview,
				setAttributes,
			} = this.props;

			if ( isUploading || isFetchingPreview ) {
				return <Loading text={ isUploading ? __( 'Uploading…' ) : __( 'Embedding…' ) } />;
			}

			if ( ! preview ) {
				return <CoreVideoEdit { ...this.props } />;
			}

			const { html, scripts } = preview;
			const { caption } = attributes;

			return (
				<Fragment>
					<BlockControls>
						<Toolbar>
							<IconButton
								className="components-icon-button components-toolbar__control"
								label={ __( 'Edit video' ) }
								onClick={ this.switchToEditing }
								icon="edit"
							/>
						</Toolbar>
					</BlockControls>
					<figure className={ classnames( className, 'wp-block-embed', 'is-type-video' ) }>
						{ /*
						Disable the video player so the user clicking on it won't play the
						video when the controls are enabled.
					*/ }
						<Disabled>
							<div className="wp-block-embed__wrapper">
								<SandBox html={ html } scripts={ scripts } />
							</div>
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
				</Fragment>
			);
		}
	};

export default createHigherOrderComponent(
	compose( [
		withSelect( ( select, ownProps ) => {
			const { id, src } = ownProps.attributes;
			const { getEmbedPreview, getMedia, isRequestingEmbedPreview } = select( 'core' );

			const media = !! id && getMedia( id );
			const guid = get( media, 'jetpack_videopress.guid' );
			const url = !! guid && getVideoPressUrlFromGuid( guid );
			const preview = !! url && getEmbedPreview( url );

			const isFetchingMedia = !! id && ! media;
			const isFetchingEmbedPreview = !! url && isRequestingEmbedPreview( url );
			const isUploading = ! id && isBlobURL( src );

			return {
				guid,
				isFetchingPreview: isFetchingMedia || isFetchingEmbedPreview,
				isUploading,
				preview,
			};
		} ),
		VideoPressEdit,
	] ),
	'withVideoPressEdit'
);
