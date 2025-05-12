import { CheckboxControl } from '@wordpress/components';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { isFetchingNotificationsSettings } from 'calypso/state/notification-settings/selectors';
import { NOTIFICATIONS_EXCEPTIONS } from './constants';

class StreamOptions extends PureComponent {
	static displayName = 'NotificationSettingsFormStreamOptions';

	static propTypes = {
		blogId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
		stream: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
		settings: PropTypes.object.isRequired,
		onToggle: PropTypes.func.isRequired,
		isFetching: PropTypes.bool,
	};

	// Assume this is a device stream if not timeline or email
	isDeviceStream = () => {
		return [ 'timeline', 'email' ].indexOf( this.props.stream ) === -1;
	};

	render() {
		return (
			<ul className="notification-settings-form-stream-options">
				{ this.props.settingKeys.map( ( setting, index ) => {
					const isException =
						( this.props.stream in NOTIFICATIONS_EXCEPTIONS &&
							NOTIFICATIONS_EXCEPTIONS[ this.props.stream ].indexOf( setting ) >= 0 ) ||
						( [ 'blogging_prompt', 'draft_post_prompt' ].includes( setting ) &&
							this.isDeviceStream() );
					return (
						<li className="notification-settings-form-stream-options__item" key={ index }>
							{ isException ? null : (
								<CheckboxControl
									__nextHasNoMarginBottom
									disabled={ this.props.isFetching }
									checked={ get( this.props.settings, setting ) }
									onChange={ () => {
										this.props.onToggle( this.props.blogId, this.props.stream, setting );
									} }
								/>
							) }
						</li>
					);
				} ) }
			</ul>
		);
	}
}

const mapStateToProps = ( state ) => ( { isFetching: isFetchingNotificationsSettings( state ) } );

export default connect( mapStateToProps )( StreamOptions );
