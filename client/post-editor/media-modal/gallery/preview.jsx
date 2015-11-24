/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import SimpleNotice from 'notices/simple-notice';
import GalleryShortcode from 'components/gallery-shortcode';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import markup from '../markup';
import EditorMediaModalGalleryEdit from './edit';

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryPreview',

	propTypes: {
		site: PropTypes.object,
		settings: PropTypes.object,
		onUpdateSetting: PropTypes.func,
		invalidItemDropped: PropTypes.bool,
		onDismissInvalidItemDropped: PropTypes.func
	},

	getInitialState() {
		return {
			isEditing: false
		};
	},

	getDefaultProps() {
		return {
			settings: Object.freeze( {} ),
			onUpdateSetting: () => {},
			invalidItemDropped: false,
			onDismissInvalidItemDropped: () => {}
		};
	},

	renderPreviewModeToggle() {
		return (
			<SegmentedControl className="editor-media-modal-gallery__preview-toggle" compact={ true }>
				<SegmentedControlItem
					selected={ ! this.state.isEditing }
					onClick={ () => this.setState( { isEditing: false } ) }>
					{ this.translate( 'Preview' ) }
				</SegmentedControlItem>
				<SegmentedControlItem
					selected={ this.state.isEditing }
					onClick={ () => this.setState( { isEditing: true } ) }>
					{ this.translate( 'Edit' ) }
				</SegmentedControlItem>
			</SegmentedControl>
		);
	},

	renderPreview() {
		const { site, settings, onUpdateSetting } = this.props;

		if ( ! site || ! settings.items ) {
			return;
		}

		if ( this.state.isEditing ) {
			return (
				<EditorMediaModalGalleryEdit
					site={ site }
					settings={ settings }
					onUpdateSetting={ onUpdateSetting } />
			);
		}

		if ( settings && 'individual' === settings.type ) {
			return (
				<div className="editor-media-modal-gallery__preview-individual">
					<div className="editor-media-modal-gallery__preview-individual-content">
						{ settings.items.map( ( item ) => {
							const caption = markup.caption( item );

							if ( null === caption ) {
								return <div key={ item.ID } dangerouslySetInnerHTML={ { __html: markup.get( item ) } } />;
							}

							return React.cloneElement( caption, { key: item.ID } );
						} ) }
					</div>
				</div>
			);
		}

		return (
			<GalleryShortcode
				siteId={ site.ID }
				items={ settings.items }
				type={ settings.type }
				columns={ settings.columns }
				orderBy={ settings.orderBy }
				link={ settings.link }
				size={ settings.size }
				className="editor-media-modal-gallery__preview-iframe" />
		);
	},

	render() {
		return (
			<div className="editor-media-modal-gallery__preview">
				{ this.props.invalidItemDropped && (
					<SimpleNotice status="is-warning" onClick={ this.props.onDismissInvalidItemDropped } isCompact>
						{ this.translate( 'Galleries can only include images. All other uploads will be added to your media library.' ) }
					</SimpleNotice>
				) }
				<div className="editor-media-modal-gallery__preview-wrapper">
					{ this.renderPreview() }
				</div>
				{ this.renderPreviewModeToggle() }
			</div>
		);
	}
} );

