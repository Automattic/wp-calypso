/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import StreamHeader from './stream-header';
import FormSelect from 'components/forms/form-select';

export default React.createClass( {
	displayName: 'NotificationSettingsFormDeviceSelector',

	mixins: [ PureRenderMixin ],

	propTypes: {
		devices: PropTypes.object.isRequired,
		selectedDeviceIndex: PropTypes.number.isRequired,
		onChange: PropTypes.func.isRequired
	},

	render() {
		if ( this.props.devices.get().length === 1 ) {
			return ( <StreamHeader title={ this.props.devices.get()[ 0 ].device_name } /> );
		}

		return (
			<div className="notification-settings-form-header">
				<div className="notification-settings-form-header__title">
					<FormSelect
						value={ this.props.selectedDeviceIndex }
						onChange={ this.props.onChange } >
						{ this.props.devices.get().map( ( device, index ) => {
							return <option key={ index } value={ index }>{ device.device_name }</option>;
						} ) }
					</FormSelect>
				</div>
			</div>
		);
	}
} );
