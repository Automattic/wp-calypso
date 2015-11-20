/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';
import { getLabelForStream } from './locales'

export default React.createClass( {
	displayName: 'NotificationSettingsFormStreamSelector',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		devices: PropTypes.object,
		selectedStream: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number
		] ).isRequired,
		settings: PropTypes.instanceOf( Immutable.Map ),
		onChange: PropTypes.func.isRequired
	},

	render() {
		const options = [ 'timeline', 'email' ]
			.map( stream => <option key={ stream } value={ stream }>{ getLabelForStream( stream ) }</option> )
			.concat( this.props.devices.get().map( device => <option key={ device.device_id } value={ device.device_id }>{ device.device_name }</option> ) );

		return (
			<div className="notification-settings-form-stream-selector">
				<FormSelect
					value={ this.props.selectedStream }
					onChange={ event => this.props.onChange( event.target.value ) } >
					{ options }
				</FormSelect>
			</div>
		);
	}
} );
