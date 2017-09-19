/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import { getLabelForStream } from './locales';
import PureRenderMixin from 'react-pure-render/mixin';

export default React.createClass( {
	displayName: 'NotificationSettingsFormHeader',

	mixins: [ PureRenderMixin ],

	propTypes: {
		stream: PropTypes.string,
		title: PropTypes.string
	},

	renderTitle() {
		return getLabelForStream( this.props.stream ) || this.props.title;
	},

	render() {
		return (
			<div className="notification-settings-form-header">
				<div className="notification-settings-form-header__title">
					{ this.props.stream === 'timeline' ? <Gridicon icon="bell" /> : this.renderTitle() }
				</div>
			</div>
		);
	}
} );
