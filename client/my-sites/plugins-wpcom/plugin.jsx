import React, { PropTypes } from 'react';
import noop from 'lodash/noop';

import Gridicon from 'components/gridicon';

const hasHttpProtocol = url => ( /^https?:\/\//.test( url ) );

export const Plugin = React.createClass( {
	getInitialState() {
		return { isUnderMouse: false };
	},

	startHover() {
		this.setState( { isUnderMouse: true } );
	},

	stopHover() {
		this.setState( { isUnderMouse: false } );
	},

	render() {
		const {
			category,
			description,
			icon = 'plugins',
			isActive = true,
			name,
			onClick = noop,
			descriptionLink
		} = this.props;

		const { isUnderMouse } = this.state;

		const isExternalLink = hasHttpProtocol( descriptionLink );

		const target = isExternalLink
			? '_blank'
			: null;

		const linkIcon = ( isExternalLink && isUnderMouse )
			? 'external'
			: icon;

		return (
			<div className="wpcom-plugins__plugin-item">
				<a
					href={ descriptionLink }
					onClick={ onClick }
					onMouseEnter={ this.startHover }
					onMouseLeave={ this.stopHover }
					target={ target }
				>
					<div className="wpcom-plugins__plugin-icon">
						<Gridicon icon={ linkIcon } />
						{ isActive &&
							<Gridicon icon="checkmark-circle" size={ 18 } /> }
					</div>
					<div className="wpcom-plugins__plugin-title">{ name }</div>
					<div className="wpcom-plugins__plugin-category">{ category }</div>
					<p className="wpcom-plugins__plugin-description">{ description }</p>
				</a>
			</div>
		);
	}
} );

Plugin.propTypes = {
	category: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	icon: PropTypes.string,
	isActive: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	descriptionLink: PropTypes.string.isRequired
};

export default Plugin;
