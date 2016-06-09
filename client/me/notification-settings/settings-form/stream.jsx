/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import Immutable from 'immutable';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StreamHeader from './stream-header';
import DeviceSelector from './device-selector';
import StreamOptions from './stream-options';

export default React.createClass( {
	displayName: 'NotificationSettingsFormStream',

	mixins: [ PureRenderMixin ],

	propTypes: {
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
	},

	getInitialState() {
		return {
			selectedDeviceIndex: 0
		};
	},

	getStreamSettings() {
		let { stream, settings } = this.props;

		if ( this.props.devices && this.props.devices.initialized && this.props.devices.get().length > 0 ) {
			stream = parseInt( this.props.devices.get()[ this.state.selectedDeviceIndex ].device_id, 10 );
			settings = this.props.settings.find( device => device.get( 'device_id' ) === stream );
		}

		return { stream, settings };
	},

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
} );
