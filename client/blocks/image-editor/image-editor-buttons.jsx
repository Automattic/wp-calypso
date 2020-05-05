/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import {
	getImageEditorFileInfo,
	imageEditorHasChanges,
} from 'state/ui/editor/image-editor/selectors';

class ImageEditorButtons extends Component {
	static propTypes = {
		src: PropTypes.string,
		hasChanges: PropTypes.bool,
		resetImageEditorState: PropTypes.func,
		onDone: PropTypes.func,
		onCancel: PropTypes.func,
		onReset: PropTypes.func,
		doneButtonText: PropTypes.string,
	};

	static defaultProps = {
		src: '',
		hasChanges: false,
		resetImageEditorState: noop,
		onDone: noop,
		onCancel: noop,
		onReset: noop,
		doneButtonText: '',
	};

	render() {
		const { hasChanges, onCancel, src, onDone, onReset, translate, doneButtonText } = this.props;

		return (
			<div className="image-editor__buttons">
				{ onCancel && (
					<Button
						className="image-editor__buttons-button"
						onClick={ onCancel }
						data-e2e-button="cancel"
					>
						{ translate( 'Cancel' ) }
					</Button>
				) }
				<Button
					className="image-editor__buttons-button"
					disabled={ ! hasChanges }
					onClick={ onReset }
					data-e2e-button="reset"
				>
					{ translate( 'Reset' ) }
				</Button>
				<Button
					className="image-editor__buttons-button"
					disabled={ ! src }
					primary
					onClick={ onDone }
					data-e2e-button="done"
					data-tip-target="image-editor-button-done"
				>
					{ doneButtonText || translate( ' Done ' ) }
				</Button>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const { src } = getImageEditorFileInfo( state ),
		hasChanges = imageEditorHasChanges( state );

	return {
		src,
		hasChanges,
	};
} )( localize( ImageEditorButtons ) );
