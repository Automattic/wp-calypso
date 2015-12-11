/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import Labels from './labels';
import Stream from './stream';
import StreamSelector from './stream-selector';

/**
 * Module variables
 */
const streams = {
	TIMELINE: 'timeline',
	EMAIL: 'email',
	DEVICES: 'devices'
};

export default React.createClass( {
	displayName: 'NotificationSettingsForm',

	mixins: [ PureRenderMixin ],

	propTypes: {
		blogId: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number
		] ).isRequired,
		devices: PropTypes.object,
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
		settings: PropTypes.instanceOf( Immutable.Map ).isRequired,
		onToggle: PropTypes.func.isRequired
	},

	getInitialState() {
		return {
			selectedStream: streams.TIMELINE
		};
	},

	getSelectedStreamSettings() {
		if ( isNaN( this.state.selectedStream ) ) {
			return this.props.settings.get( this.state.selectedStream );
		}

		return this.props.settings
			.get( 'devices' )
			.find( device => device.get( 'device_id' ) === parseInt( this.state.selectedStream, 10 ) );
	},

	render() {
		const selectedStreamSettings = this.getSelectedStreamSettings();

		return (
			<div className="notification-settings-form">
				<StreamSelector
					devices={ this.props.devices }
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
					{ ( () => {
						if ( this.props.devices && this.props.devices.initialized && this.props.devices.get().length > 0 ) {
							return <Stream
								key={ streams.DEVICES }
								blogId={ this.props.blogId }
								devices={ this.props.devices }
								settingKeys={ this.props.settingKeys }
								settings={ this.props.settings.get( streams.DEVICES ) }
								onToggle={ this.props.onToggle } />
						}
					} )() }
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
} );
