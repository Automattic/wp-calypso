/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import { NOTIFICATIONS_EXCEPTIONS } from './constants';
import FormCheckbox from 'components/forms/form-checkbox';

export default React.createClass( {
	displayName: 'NotificationSettingsFormStreamOptions',

	mixins: [ PureRenderMixin ],

	propTypes: {
		blogId: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number
		] ).isRequired,
		stream: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number
		] ).isRequired,
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
		settings: PropTypes.instanceOf( Immutable.Map ).isRequired,
		onToggle: PropTypes.func.isRequired
	},

	render() {
		return (
			<ul className="notification-settings-form-stream-options">
				{ this.props.settingKeys.map( ( setting, index ) => {
					const isException = this.props.stream in NOTIFICATIONS_EXCEPTIONS && NOTIFICATIONS_EXCEPTIONS[ this.props.stream ].indexOf( setting ) >= 0;

					return ( <li className="notification-settings-form-stream-options__item" key={ index }>
						{ isException ? null : <FormCheckbox checked={ this.props.settings.get( setting ) } onChange={ () => {
							this.props.onToggle( this.props.blogId, this.props.stream, setting );
						} } /> }
					</li> );
				} ) }
			</ul>
		);
	}
} );
