/**
 * External dependencies
 */
import React from 'react';

export default React.createClass({
    displayName: 'BackToLibrary',

    render() {
        return (
            <span className="editor-media-modal__back-to-library">
                <span className="is-mobile">{this.translate('Library')}</span>
                <span className="is-desktop">{this.translate('Media Library')}</span>
            </span>
        );
    },
});
