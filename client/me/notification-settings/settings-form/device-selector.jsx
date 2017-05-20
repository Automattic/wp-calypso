/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import { size, map, first } from 'lodash';

/**
 * Internal dependencies
 */
import { getUserDevices } from 'state/selectors';
import StreamHeader from './stream-header';
import FormSelect from 'components/forms/form-select';

class NotificationSettingsFormDeviceSelector extends PureComponent {
	static propTypes = {
		devices: PropTypes.array.isRequired,
		selectedDeviceIndex: PropTypes.number.isRequired,
		onChange: PropTypes.func.isRequired
	};

	render() {
		const { devices } = this.props;
		if ( size( devices ) === 1 ) {
			return ( <StreamHeader title={ first( devices ).device_name } /> );
		}

		return (
			<div className="notification-settings-form-header">
				<div className="notification-settings-form-header__title">
					<FormSelect
						value={ this.props.selectedDeviceIndex }
						onChange={ this.props.onChange } >
						{ map( devices, ( device, index ) => {
							return <option key={ index } value={ index }>{ device.device_name }</option>;
						} ) }
					</FormSelect>
				</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		devices: getUserDevices( state )
	} )
)( NotificationSettingsFormDeviceSelector );
