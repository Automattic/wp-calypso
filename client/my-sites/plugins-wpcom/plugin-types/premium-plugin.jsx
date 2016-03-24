import React, { PropTypes } from 'react';

import Gridicon from 'components/gridicon';

export const PremiumPlugin = React.createClass( {
	render() {
		const {
			description,
			icon = 'plugins',
			name,
			plan,
			supportLink
		} = this.props;

		return (
			<div className="wpcom-premium-plugin">
				<div>
					<Gridicon { ...{ icon } } />
					<a href={ supportLink } target="_blank">{ name }</a>
					<div>{ plan }</div>
				</div>
				<div>
					{ description }
				</div>
			</div>
		);
	}
} );

PremiumPlugin.propTypes = {
	name: PropTypes.string.isRequired,
	supportLink: PropTypes.string.isRequired,
	icon: PropTypes.string,
	plan: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired
};

export default PremiumPlugin;
