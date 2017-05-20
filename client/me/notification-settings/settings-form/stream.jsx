/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import classNames from 'classnames';
import { size } from 'lodash';

/**
 * Internal dependencies
 */
import { isRequestingUserDevices } from 'state/selectors';
import StreamHeader from './stream-header';
import DeviceSelector from './device-selector';
import StreamOptions from './stream-options';

class NotificationSettingsFormStream extends PureComponent {
	static propTypes = {
		blogId: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number
		] ).isRequired,
		stream: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number
		] ),
		settingKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
		settings: PropTypes.oneOfType( [
			PropTypes.instanceOf( Immutable.List ),
			PropTypes.instanceOf( Immutable.Map )
		] ).isRequired,
		onToggle: PropTypes.func.isRequired
	};

	state = { selectedDeviceIndex: 0 };

	getStreamSettings = () => {
		let { stream, settings } = this.props;

		if ( this.props.devices && ! this.props.requestingUserDevices && size( this.props.devices ) > 0 ) {
			stream = parseInt( this.props.devices[ this.state.selectedDeviceIndex ].device_id, 10 );
			settings = this.props.settings.find( device => device.get( 'device_id' ) === stream );
		}

		return { stream, settings };
	};

	render() {
		const { stream, settings } = this.getStreamSettings();

		return (
			<div className={ classNames( 'notification-settings-form-stream', this.props.className ) }>
				{ ( () => {
					if ( this.props.devices ) {
						return <DeviceSelector
							devices={ this.props.devices }
							selectedDeviceIndex={ this.state.selectedDeviceIndex }
							onChange={ event => this.setState( { selectedDeviceIndex: parseInt( event.target.value, 10 ) } ) } />;
					}

					return ( <StreamHeader stream={ this.props.stream } /> );
				} )() }
				<StreamOptions
					blogId={ this.props.blogId }
					stream={ stream }
					settingKeys={ this.props.settingKeys }
					settings={ settings }
					onToggle={ this.props.onToggle } />
			</div>
		);
	}
}

export default connect(
	state => ( { requestingUserDevices: isRequestingUserDevices( state ) } )
)( NotificationSettingsFormStream );
