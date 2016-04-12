import React, { PropTypes } from 'react';
import noop from 'lodash/noop';

import Gridicon from 'components/gridicon';

export const PremiumPlugin = React.createClass( {
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

PremiumPlugin.propTypes = {
	name: PropTypes.string.isRequired,
	supportLink: PropTypes.string.isRequired,
	icon: PropTypes.string,
	plan: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	description: PropTypes.string.isRequired
};

export default PremiumPlugin;
