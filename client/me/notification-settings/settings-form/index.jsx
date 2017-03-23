/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import Settings from './settings';
import Actions from './actions';

export default React.createClass({
    displayName: 'NotificationSettingsForm',

    propTypes: {
        sourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        devices: PropTypes.object,
        settingKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
        settings: PropTypes.instanceOf(Immutable.Map),
        isApplyAllVisible: PropTypes.bool,
        hasUnsavedChanges: PropTypes.bool.isRequired,
        onToggle: PropTypes.func.isRequired,
        onSave: PropTypes.func.isRequired,
        onSaveToAll: PropTypes.func,
    },

    render() {
        return (
            <div>
                <Settings
                    blogId={this.props.sourceId}
                    devices={this.props.devices}
                    settingKeys={this.props.settingKeys}
                    settings={this.props.settings}
                    onToggle={this.props.onToggle}
                />
                <Actions
                    sourceId={this.props.sourceId}
                    settings={this.props.settings}
                    isApplyAllVisible={this.props.isApplyAllVisible}
                    disabled={!this.props.hasUnsavedChanges}
                    onSave={this.props.onSave}
                    onSaveToAll={this.props.onSaveToAll}
                />
            </div>
        );
    },
});
