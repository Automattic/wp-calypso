import React, { PropTypes } from 'react';

import Gridicon from 'components/gridicon';

export const StandardPlugin = React.createClass( {
	render() {
		const {
			category,
			description,
			icon = 'plugins',
			name,
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
				<div className="wpcom-plugins__plugin-category">{ category }</div>
				<p className="wpcom-plugins__plugin-description">{ description }</p>
			</div>
		);
	}
} );

StandardPlugin.propTypes = {
	category: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	icon: PropTypes.string,
	name: PropTypes.string.isRequired,
	supportLink: PropTypes.string.isRequired
};

export default StandardPlugin;
