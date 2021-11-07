import { get } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { NOTIFICATIONS_EXCEPTIONS } from './constants';

export default class extends PureComponent {
	static displayName = 'NotificationSettingsFormStreamOptions';

	static propTypes = {
		blogId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
		stream: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
		settings: PropTypes.object.isRequired,
		onToggle: PropTypes.func.isRequired,
	};

	render() {
		return (
			<ul className="notification-settings-form-stream-options">
				{ this.props.settingKeys.map( ( setting, index ) => {
					const isException =
						this.props.stream in NOTIFICATIONS_EXCEPTIONS &&
						NOTIFICATIONS_EXCEPTIONS[ this.props.stream ].indexOf( setting ) >= 0;

					return (
						<li className="notification-settings-form-stream-options__item" key={ index }>
							{ isException ? null : (
								<FormCheckbox
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
