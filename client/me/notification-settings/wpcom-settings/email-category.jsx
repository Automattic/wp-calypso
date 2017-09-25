/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import { toggleWPcomEmailSetting } from 'lib/notification-settings-store/actions';

const EmailCategory = React.createClass( {
	propTypes() {
		return {
			name: PropTypes.string,
			isEnabled: PropTypes.bool,
			title: PropTypes.string,
			description: PropTypes.string
		};
	},

	toggleSetting() {
		toggleWPcomEmailSetting( this.props.name );
	},

	render() {
		return (
			<FormFieldset>
				<FormLegend>{ this.props.title }</FormLegend>
				<FormLabel>
					<FormCheckbox checked={ this.props.isEnabled } onChange={ this.toggleSetting } />
					<span>{ this.props.description }</span>
				</FormLabel>
			</FormFieldset>
		);
	}
} );

export default EmailCategory;
