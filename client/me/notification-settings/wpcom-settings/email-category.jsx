import { FormLabel } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import { toggleWPcomEmailSetting } from 'calypso/state/notification-settings/actions';

class EmailCategory extends Component {
	static propTypes = {
		name: PropTypes.string,
		isEnabled: PropTypes.bool,
		title: PropTypes.string,
		description: PropTypes.string,
	};

	toggleSetting = () => {
		this.props.toggleWPcomEmailSetting( this.props.name );
	};

	render() {
		return (
			<FormFieldset>
				<FormLegend>{ this.props.title }</FormLegend>
				<FormLabel>
					<CheckboxControl
						checked={ this.props.isEnabled }
						onChange={ this.toggleSetting }
						label={ this.props.description }
					/>
				</FormLabel>
			</FormFieldset>
		);
	}
}

export default connect( null, { toggleWPcomEmailSetting } )( EmailCategory );
