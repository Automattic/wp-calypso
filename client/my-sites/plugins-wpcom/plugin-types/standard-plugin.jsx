import React, { PropTypes } from 'react';
import noop from 'lodash/noop';

import Gridicon from 'components/gridicon';

export const StandardPlugin = React.createClass( {
	render() {
		const {
			category,
			description,
			icon = 'plugins',
			name,
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
					<div className="wpcom-plugins__plugin-category">{ category }</div>
					<p className="wpcom-plugins__plugin-description">{ description }</p>
				</a>
			</div>
		);
	}
} );

StandardPlugin.propTypes = {
	category: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	icon: PropTypes.string,
	name: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	supportLink: PropTypes.string.isRequired
};

export default StandardPlugin;
