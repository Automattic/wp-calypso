/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
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
    };

    static defaultProps = {
        src: '',
        hasChanges: false,
        resetImageEditorState: noop,
        onDone: noop,
        onCancel: noop,
        onReset: noop,
    };

    render() {
        const {
            hasChanges,
            onCancel,
            src,
            onDone,
            onReset,
            translate,
        } = this.props;

        return (
            <div className="image-editor__buttons">
                {onCancel &&
                    <Button className="image-editor__buttons-button" onClick={onCancel}>
                        {translate('Cancel')}
                    </Button>}
                <Button
                    className="image-editor__buttons-button"
                    disabled={!hasChanges}
                    onClick={onReset}
                >
                    {translate('Reset')}
                </Button>
                <Button
                    className="image-editor__buttons-button"
                    disabled={!src}
                    primary
                    onClick={onDone}
                >
                    {translate(' Done ')}
                </Button>
            </div>
        );
    }
}

export default connect(state => {
    const { src } = getImageEditorFileInfo(state), hasChanges = imageEditorHasChanges(state);

    return {
        src,
        hasChanges,
    };
})(localize(ImageEditorButtons));
