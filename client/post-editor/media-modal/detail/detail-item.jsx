/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	noop = require( 'lodash/noop' );

/**
 * Internal dependencies
 */
var EditorMediaModalDetailFields = require( './detail-fields' ),
	EditorMediaModalDetailFileInfo = require( './detail-file-info' ),
	EditorMediaModalDetailPreviewImage = require( './detail-preview-image' ),
	EditorMediaModalDetailPreviewVideo = require( './detail-preview-video' ),
	EditorMediaModalDetailPreviewAudio = require( './detail-preview-audio' ),
	EditorMediaModalDetailPreviewDocument = require( './detail-preview-document' ),
	Button = require( 'components/button' ),
	Gridicon = require( 'components/gridicon' ),
	userCan = require( 'lib/site/utils' ).userCan,
	MediaUtils = require( 'lib/media/utils' ),
	config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'EditorMediaModalDetailItem',

	propTypes: {
		site: React.PropTypes.object,
		item: React.PropTypes.object,
		hasPreviousItem: React.PropTypes.bool,
		hasNextItem: React.PropTypes.bool,
		onShowPreviousItem: React.PropTypes.func,
		onShowNextItem: React.PropTypes.func,
		onEdit: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			hasPreviousItem: false,
			hasNextItem: false,
			onShowPreviousItem: noop,
			onShowNextItem: noop,
			onEdit: noop
		};
	},

	renderEditButton: function() {
		if ( ! config.isEnabled( 'post-editor/image-editor' ) ||
			! userCan( 'upload_files', this.props.site ) ||
			! this.props.item ) {
			return;
		}

		const mimePrefix = MediaUtils.getMimePrefix( this.props.item );

		if ( 'image' !== mimePrefix ) {
			return;
		}

		return (
			<Button
				className="is-desktop editor-media-modal-detail__edit"
				onClick={ this.props.onEdit }>
				<Gridicon icon="pencil" size={ 36 } /> { this.translate( 'Edit Image' ) }
			</Button>
		);
	},

	renderFields: function() {
		if ( ! userCan( 'upload_files', this.props.site ) ) {
			return;
		}

		return (
			<EditorMediaModalDetailFields
				site={ this.props.site }
				item={ this.props.item } />
		);
	},

	renderPreviousItemButton: function() {
		if ( ! this.props.hasPreviousItem ) {
			return;
		}

		return (
			<button
				onClick={ this.props.onShowPreviousItem }
				className="editor-media-modal-detail__previous">
				<Gridicon icon="chevron-left" size={ 36 } />
				<span className="screen-reader-text">
					{ this.translate( 'Previous' ) }
				</span>
			</button>
		);
	},

	renderNextItemButton: function() {
		if ( ! this.props.hasNextItem ) {
			return;
		}

		return (
			<button
				onClick={ this.props.onShowNextItem }
				className="editor-media-modal-detail__next">
				<Gridicon icon="chevron-right" size={ 36 } />
				<span className="screen-reader-text">
					{ this.translate( 'Next' ) }
				</span>
			</button>
		);
	},

	renderItem: function() {
		var mimePrefix, Component;

		if ( ! this.props.item ) {
			return;
		}

		mimePrefix = MediaUtils.getMimePrefix( this.props.item );
		switch ( mimePrefix ) {
			case 'image': Component = EditorMediaModalDetailPreviewImage; break;
			case 'video': Component = EditorMediaModalDetailPreviewVideo; break;
			case 'audio': Component = EditorMediaModalDetailPreviewAudio; break;
			default: Component = EditorMediaModalDetailPreviewDocument; break;
		}

		return React.createElement( Component, {
			site: this.props.site,
			item: this.props.item
		} );
	},

	render: function() {
		var classes = classNames( 'editor-media-modal-detail__item', {
			'is-loading': ! this.props.item
		} );

		return (
			<figure className={ classes }>
				<div className="editor-media-modal-detail__content editor-media-modal__content">
					<div className="editor-media-modal-detail__preview-wrapper">
						{ this.renderItem() }
						{ this.renderPreviousItemButton() }
						{ this.renderNextItemButton() }
					</div>
					<div className="editor-media-modal-detail__sidebar">
						{ this.renderEditButton() }
						{ this.renderFields() }
						<EditorMediaModalDetailFileInfo
							item={ this.props.item } />
					</div>
				</div>
			</figure>
		);
	}
} );
