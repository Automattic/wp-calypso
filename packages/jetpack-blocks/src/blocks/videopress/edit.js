/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { isBlobURL } from '@wordpress/blob';
import { compose, createHigherOrderComponent } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Disabled, IconButton, SandBox, Toolbar } from '@wordpress/components';
import { BlockControls, RichText } from '@wordpress/editor';
import { Component, createRef, Fragment } from '@wordpress/element';
import classnames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';
import Loading from './loading';

const VideoPressEdit = CoreVideoEdit =>
	class extends Component {
		constructor() {
			super( ...arguments );
			this.state = {
				media: null,
				isFetchingMedia: false,
				fallback: false,
			};
			this.posterImageButton = createRef();
		}

		componentDidMount() {
			const { guid } = this.props.attributes;
			if ( ! guid ) {
				this.setGuid();
			}
		}

		componentDidUpdate( prevProps ) {
			const { attributes } = this.props;

			if ( attributes.id !== prevProps.attributes.id ) {
				this.setGuid();
			}
		}

		fallbackToCore = () => {
			this.props.setAttributes( { guid: undefined } );
			this.setState( { fallback: true } );
		};

		setGuid = async () => {
			const { attributes, setAttributes } = this.props;
			const { id } = attributes;

			if ( ! id ) {
				setAttributes( { guid: undefined } );
				return;
			}

			try {
				this.setState( { isFetchingMedia: true } );
				const media = await apiFetch( { path: `/wp/v2/media/${ id }` } );
				this.setState( { isFetchingMedia: false } );

				const { id: currentId } = this.props.attributes;
				if ( id !== currentId ) {
					// Video was changed in the editor while fetching data for the previous video;
					return;
				}

				this.setState( { media } );
				const guid = get( media, 'jetpack_videopress_guid' );
				if ( guid ) {
					setAttributes( { guid } );
				} else {
					this.fallbackToCore();
				}
			} catch ( e ) {
				this.setState( { isFetchingMedia: false } );
				this.fallbackToCore();
			}
		};

		switchToEditing = () => {
			this.props.setAttributes( {
				id: undefined,
				guid: undefined,
				src: undefined,
			} );
		};

		onRemovePoster = () => {
			this.props.setAttributes( { poster: '' } );

			// Move focus back to the Media Upload button.
			this.posterImageButton.current.focus();
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
			const { fallback, isFetchingMedia } = this.state;

			if ( isUploading ) {
				return <Loading text={ __( 'Uploading…' ) } />;
			}

			if ( isFetchingMedia || isFetchingPreview ) {
				return <Loading text={ __( 'Embedding…' ) } />;
			}

			if ( fallback || ! preview ) {
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
			const { guid, src } = ownProps.attributes;
			const { getEmbedPreview, isRequestingEmbedPreview } = select( 'core' );

			const url = !! guid && `https://videopress.com/v/${ guid }`;
			const preview = !! url && getEmbedPreview( url );

			const isFetchingEmbedPreview = !! url && isRequestingEmbedPreview( url );
			const isUploading = isBlobURL( src );

			return {
				isFetchingPreview: isFetchingEmbedPreview,
				isUploading,
				preview,
			};
		} ),
		VideoPressEdit,
	] ),
	'withVideoPressEdit'
);
