/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import EditorMediaModalGalleryEdit from './edit';
import EditorMediaModalGalleryPreviewShortcode from './preview-shortcode';
import EditorMediaModalGalleryPreviewIndividual from './preview-individual';

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

		if ( 'individual' === settings.type ) {
			return (
				<EditorMediaModalGalleryPreviewIndividual
					items={ settings.items } />
			);
		}

		return (
			<EditorMediaModalGalleryPreviewShortcode
				siteId={ site.ID }
				settings={ settings } />
		);
	},

	render() {
		return (
			<div className="editor-media-modal-gallery__preview">
				{ this.props.invalidItemDropped && (
					<Notice status="is-warning" onDismissClick={ this.props.onDismissInvalidItemDropped } isCompact>
						{ this.translate( 'Galleries can only include images. All other uploads will be added to your media library.' ) }
					</Notice>
				) }
				<div className="editor-media-modal-gallery__preview-wrapper">
					{ this.renderPreview() }
				</div>
				{ this.renderPreviewModeToggle() }
			</div>
		);
	}
} );

