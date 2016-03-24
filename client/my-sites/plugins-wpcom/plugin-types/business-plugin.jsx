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
			<div className="wpcom-business-plugin">
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
