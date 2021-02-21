/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { find, first, size } from 'lodash';

/**
 * Internal dependencies
 */
import StreamHeader from './stream-header';
import DeviceSelector from './device-selector';
import StreamOptions from './stream-options';

class NotificationSettingsFormStream extends PureComponent {
	static propTypes = {
		blogId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
		stream: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
		settings: PropTypes.oneOfType( [ PropTypes.array, PropTypes.object ] ).isRequired,
		onToggle: PropTypes.func.isRequired,
	};

	state = { selectedDeviceId: null };

	getStreamSettings = () => {
		let { stream, settings } = this.props;

		if ( this.props.devices && size( this.props.devices ) > 0 ) {
			stream = parseInt( this.state.selectedDeviceId || first( this.props.devices ).id, 10 );
			settings = find( this.props.settings, { device_id: stream } );
		}

		return { stream, settings };
	};

	onChangeDevices = ( event ) =>
		this.setState( { selectedDeviceId: parseInt( event.target.value, 10 ) } );

	render() {
		const { stream, settings } = this.getStreamSettings();

		return (
			<div className={ classNames( 'notification-settings-form-stream', this.props.className ) }>
				{ ( () => {
					if ( this.props.devices ) {
						return (
							<DeviceSelector
								devices={ this.props.devices }
								selectedDeviceId={ stream }
								onChange={ this.onChangeDevices }
							/>
						);
					}

					return <StreamHeader stream={ this.props.stream } />;
				} )() }
				<StreamOptions
					blogId={ this.props.blogId }
					stream={ stream }
					settingKeys={ this.props.settingKeys }
					settings={ settings }
					onToggle={ this.props.onToggle }
				/>
			</div>
		);
	}
}

export default connect()( NotificationSettingsFormStream );
