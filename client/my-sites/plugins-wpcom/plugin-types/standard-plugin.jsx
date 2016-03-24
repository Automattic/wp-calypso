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
			<div className="wpcom-standard-plugin">
				<div>
					<Gridicon { ...{ icon } } />
					<a href={ supportLink } target="_blank">{ name }</a>
					<div>{ category }</div>
				</div>
				<div>
					{ description }
				</div>
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
