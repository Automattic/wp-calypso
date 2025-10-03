import { Icon, bell } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { getLabelForStream } from './locales';

export default class extends PureComponent {
	static displayName = 'NotificationSettingsFormHeader';

	static propTypes = {
		stream: PropTypes.string,
		title: PropTypes.string,
	};

	renderTitle = () => {
		return getLabelForStream( this.props.stream ) || this.props.title;
	};

	render() {
		return (
			<div className="notification-settings-form-header">
				<div className="notification-settings-form-header__title">
					{ this.props.stream === 'timeline' ? <Icon icon={ bell } /> : this.renderTitle() }
				</div>
			</div>
		);
	}
}
