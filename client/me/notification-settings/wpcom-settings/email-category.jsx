/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import { toggleWPcomEmailSetting } from 'lib/notification-settings-store/actions';

const EmailCategory = React.createClass({
    propTypes() {
        return {
            name: React.PropTypes.string,
            isEnabled: React.PropTypes.bool,
            title: React.PropTypes.string,
            description: React.PropTypes.string,
        };
    },

    toggleSetting() {
        toggleWPcomEmailSetting(this.props.name);
    },

    render() {
        return (
            <FormFieldset>
                <FormLegend>{this.props.title}</FormLegend>
                <FormLabel>
                    <FormCheckbox checked={this.props.isEnabled} onChange={this.toggleSetting} />
                    <span>{this.props.description}</span>
                </FormLabel>
            </FormFieldset>
        );
    },
});

export default EmailCategory;
