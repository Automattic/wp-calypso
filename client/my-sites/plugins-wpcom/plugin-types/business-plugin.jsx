import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import has from 'lodash/has';
import noop from 'lodash/noop';

import { recordTracksEvent } from 'state/analytics/actions';

import Gridicon from 'components/gridicon';

export const BusinessPlugin = React.createClass( {
	render() {
		const {
			description,
			icon = 'plugins',
			name,
			plan,
			onClick = noop,
			supportLink
		} = this.props;

		return (
			<div className="wpcom-plugins__plugin-item">
				<a onClick={ onClick } href={ supportLink } target="_blank">
					<div className="wpcom-plugins__plugin-icon">
						<Gridicon { ...{ icon } } />
					</div>
					<div className="wpcom-plugins__plugin-title">{ name }</div>
					<div className="wpcom-plugins__plugin-plan">{ plan }</div>
					<p className="wpcom-plugins__plugin-description">{ description }</p>
				</a>
			</div>
		);
	}
} );

BusinessPlugin.propTypes = {
	name: PropTypes.string.isRequired,
	supportLink: PropTypes.string.isRequired,
	icon: PropTypes.string,
	onClick: PropTypes.func,
	plan: PropTypes.string.isRequired,
	description: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.element
	] ).isRequired
};

const trackClick = name => recordTracksEvent(
	'calypso_plugin_wpcom_click',
	{
		plugin_name: name,
		plugin_plan: 'business'
	}
);

const mapDispatchToProps = ( dispatch, props ) => ( {
	onClick: has( props, 'onClick' )
		? props.onClick
		: () => dispatch( trackClick( props.name ) )
} );

export default connect( null, mapDispatchToProps )( BusinessPlugin );
