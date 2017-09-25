/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getImageEditorFileInfo, imageEditorHasChanges } from 'state/ui/editor/image-editor/selectors';

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
		const {
			hasChanges,
			onCancel,
			src,
			onDone,
			onReset,
			translate,
			doneButtonText,
		} = this.props;

		return (
			<div className="image-editor__buttons">
				{ onCancel &&
					<Button
						className="image-editor__buttons-button"
						onClick={ onCancel }
					>
						{ translate( 'Cancel' ) }
					</Button>
				}
				<Button
					className="image-editor__buttons-button"
					disabled={ ! hasChanges }
					onClick={ onReset }
				>
					{ translate( 'Reset' ) }
				</Button>
				<Button
					className="image-editor__buttons-button"
					disabled={ ! src }
					primary
					onClick={ onDone }
				>
					{ doneButtonText || translate( ' Done ' ) }
				</Button>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const { src } = getImageEditorFileInfo( state ),
			hasChanges = imageEditorHasChanges( state );

		return {
			src,
			hasChanges
		};
	}
)( localize( ImageEditorButtons ) );
