import { FormLabel } from '@automattic/components';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
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
					<FormCheckbox checked={ this.props.isEnabled } onChange={ this.toggleSetting } />
					<span>{ this.props.description }</span>
				</FormLabel>
			</FormFieldset>
		);
	}
}

export default connect( null, { toggleWPcomEmailSetting } )( EmailCategory );
