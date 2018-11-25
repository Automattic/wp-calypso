/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import { toggleWPcomEmailSetting } from 'state/notification-settings/actions';

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
		this.props.toggleWPcomEmailSetting( this.props.name );
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

export default connect(
	null,
	{ toggleWPcomEmailSetting }
)( EmailCategory );
