import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import noop from 'lodash/noop';

import { recordTracksEvent } from 'state/analytics/actions';

import Gridicon from 'components/gridicon';

export const PremiumPlugin = React.createClass( {
	render() {
		const {
			description,
			icon = 'plugins',
			name,
			plan,
			onClick = noop,
			descriptionLink
		} = this.props;

		return (
			<div className="wpcom-plugins__plugin-item">
				<a onClick={ onClick } href={ descriptionLink } target="_blank">
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

PremiumPlugin.propTypes = {
	name: PropTypes.string.isRequired,
	descriptionLink: PropTypes.string.isRequired,
	icon: PropTypes.string,
	plan: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	description: PropTypes.string.isRequired
};

const trackClick = name => recordTracksEvent(
	'calypso_plugin_wpcom_click',
	{
		plugin_name: name,
		plugin_plan: 'premium'
	}
);

const mapDispatchToProps = ( dispatch, props ) => ( {
	onClick: get( props, 'onClick', () => dispatch( trackClick( props.name ) ) )
} );

export default connect( null, mapDispatchToProps )( PremiumPlugin );
