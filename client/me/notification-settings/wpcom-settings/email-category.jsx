/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormCheckbox from 'client/components/forms/form-checkbox';
import FormFieldset from 'client/components/forms/form-fieldset';
import FormLegend from 'client/components/forms/form-legend';
import FormLabel from 'client/components/forms/form-label';
import { toggleWPcomEmailSetting } from 'client/lib/notification-settings-store/actions';

class EmailCategory extends React.Component {
	static propTypes() {
		return {
			name: PropTypes.string,
			isEnabled: PropTypes.bool,
			title: PropTypes.string,
			description: PropTypes.string,
		};
	}

	toggleSetting = () => {
		toggleWPcomEmailSetting( this.props.name );
	};

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
}

export default EmailCategory;
