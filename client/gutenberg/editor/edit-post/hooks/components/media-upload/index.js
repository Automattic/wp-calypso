/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import EditorMediaModal from 'post-editor/editor-media-modal';
import Button from 'components/button';

export class MediaUpload extends Component {
	state = {
		isModalVisible: false,
	};

	closeModal = () => this.setState( { isModalVisible: false } );

	openModal = () => this.setState( { isModalVisible: true } );

	render() {
		const { isModalVisible } = this.state;

		return (
			<Fragment>
				<Button onClick={ this.openModal }>TEST</Button>
				<EditorMediaModal
					onClose={ this.closeModal }
					onInsertMedia={ this.closeModal }
					visible={ isModalVisible }
					source=""
				/>
			</Fragment>
		);
	}
}

export default MediaUpload;
