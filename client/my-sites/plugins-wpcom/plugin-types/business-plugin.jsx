import React, { PropTypes } from 'react';

import Gridicon from 'components/gridicon';

export const BusinessPlugin = React.createClass( {
	render() {
		const {
			description,
			icon = 'plugins',
			name,
			plan,
			supportLink
		} = this.props;

		return (
			<div className="wpcom-plugins__plugin-item">
				<div className="wpcom-plugins__plugin-icon">
					<Gridicon { ...{ icon } } />
				</div>
				<a href={ supportLink } target="_blank">
					<div className="wpcom-plugins__plugin-title">{ name }</div>
				</a>
				<div className="wpcom-plugins__plugin-plan">{ plan }</div>
				<p className="wpcom-plugins__plugin-description">{ description }</p>
			</div>
		);
	}
} );

BusinessPlugin.propTypes = {
	name: PropTypes.string.isRequired,
	supportLink: PropTypes.string.isRequired,
	icon: PropTypes.string,
	plan: PropTypes.string.isRequired,
	description: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.element
	] ).isRequired
};

export default BusinessPlugin;
