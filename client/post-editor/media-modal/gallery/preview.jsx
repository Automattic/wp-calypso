/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';
import SegmentedControl from 'calypso/components/segmented-control';
import EditorMediaModalGalleryEdit from './edit';
import EditorMediaModalGalleryPreviewShortcode from './preview-shortcode';
import EditorMediaModalGalleryPreviewIndividual from './preview-individual';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class EditorMediaModalGalleryPreview extends Component {
	static propTypes = {
		site: PropTypes.object,
		settings: PropTypes.object,
		onUpdateSetting: PropTypes.func,
		invalidItemDropped: PropTypes.bool,
		onDismissInvalidItemDropped: PropTypes.func,
	};

	static defaultProps = {
		settings: Object.freeze( {} ),
		onUpdateSetting: noop,
		invalidItemDropped: false,
		onDismissInvalidItemDropped: noop,
	};

	state = {
		isEditing: false,
	};

	renderPreviewModeToggle() {
		const { translate } = this.props;

		return (
			<SegmentedControl className="editor-media-modal-gallery__preview-toggle" compact>
				<SegmentedControl.Item
					selected={ ! this.state.isEditing }
					onClick={ () => this.setState( { isEditing: false } ) }
				>
					{ translate( 'Preview' ) }
				</SegmentedControl.Item>
				<SegmentedControl.Item
					selected={ this.state.isEditing }
					onClick={ () => this.setState( { isEditing: true } ) }
				>
					{ translate( 'Edit' ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		);
	}

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
					onUpdateSetting={ onUpdateSetting }
				/>
			);
		}

		if ( 'individual' === settings.type ) {
			return <EditorMediaModalGalleryPreviewIndividual items={ settings.items } />;
		}

		return <EditorMediaModalGalleryPreviewShortcode siteId={ site.ID } settings={ settings } />;
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="editor-media-modal-gallery__preview">
				{ this.props.invalidItemDropped && (
					<Notice
						status="is-warning"
						onDismissClick={ this.props.onDismissInvalidItemDropped }
						isCompact
					>
						{ translate(
							'Galleries can only include images. All other uploads will be added to your media library.'
						) }
					</Notice>
				) }
				<div className="editor-media-modal-gallery__preview-wrapper">{ this.renderPreview() }</div>
				{ this.renderPreviewModeToggle() }
			</div>
		);
	}
}

export default localize( EditorMediaModalGalleryPreview );
