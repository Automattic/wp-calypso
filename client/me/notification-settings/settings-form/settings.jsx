/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import Labels from './labels';
import Stream from './stream';
import StreamSelector from './stream-selector';
import { getUserDevices } from 'state/selectors';

/**
 * Module variables
 */
const streams = {
	TIMELINE: 'timeline',
	EMAIL: 'email',
	DEVICES: 'devices'
};

class NotificationSettingsForm extends PureComponent {
	static propTypes = {
		blogId: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number
		] ).isRequired,
		devices: PropTypes.array,
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
		settings: PropTypes.instanceOf( Immutable.Map ).isRequired,
		onToggle: PropTypes.func.isRequired
	};

	state = { selectedStream: streams.TIMELINE };

	getSelectedStreamSettings = () => {
		if ( isNaN( this.state.selectedStream ) ) {
			return this.props.settings.get( this.state.selectedStream );
		}

		return this.props.settings
			.get( 'devices' )
			.find( device => device.get( 'device_id' ) === parseInt( this.state.selectedStream, 10 ) );
	};

	render() {
		const selectedStreamSettings = this.getSelectedStreamSettings();

		return (
			<div className="notification-settings-form">
				<StreamSelector
					selectedStream={ this.state.selectedStream }
					onChange={ selectedStream => this.setState( { selectedStream } ) }
					settings={ selectedStreamSettings } />
				<div className="notification-settings-form__streams">
					<Labels settingKeys={ this.props.settingKeys } />
					<Stream
						key={ streams.TIMELINE }
						blogId={ this.props.blogId }
						stream={ streams.TIMELINE }
						settingKeys={ this.props.settingKeys }
						settings={ this.props.settings.get( streams.TIMELINE ) }
						onToggle={ this.props.onToggle } />
					<Stream
						key={ streams.EMAIL }
						blogId={ this.props.blogId }
						stream={ streams.EMAIL }
						settingKeys={ this.props.settingKeys }
						settings={ this.props.settings.get( streams.EMAIL ) }
						onToggle={ this.props.onToggle } />
					{ this.props.devices && this.props.devices.length > 0 &&
						<Stream
							key={ streams.DEVICES }
							blogId={ this.props.blogId }
							devices={ this.props.devices }
							settingKeys={ this.props.settingKeys }
							settings={ this.props.settings.get( streams.DEVICES ) }
							onToggle={ this.props.onToggle } />
					}
					<Stream
						key={ 'selected-stream' }
						className={ 'selected-stream' }
						blogId={ this.props.blogId }
						stream={ this.state.selectedStream }
						settingKeys={ this.props.settingKeys }
						settings={ selectedStreamSettings }
						onToggle={ this.props.onToggle } />
				</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		devices: getUserDevices( state )
	} )
)( NotificationSettingsForm );
