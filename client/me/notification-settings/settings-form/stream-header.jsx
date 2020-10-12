/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { getLabelForStream } from './locales';

export default class extends React.PureComponent {
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
					{ this.props.stream === 'timeline' ? <Gridicon icon="bell" /> : this.renderTitle() }
				</div>
			</div>
		);
	}
}
