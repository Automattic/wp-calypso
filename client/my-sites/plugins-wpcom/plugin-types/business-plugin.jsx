import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import noop from 'lodash/noop';

import { recordTracksEvent } from 'state/analytics/actions';

import Gridicon from 'components/gridicon';

const hasHttpProtocol = url => ( /^https?:\/\//.test( url ) );

export const BusinessPlugin = React.createClass( {
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
			description,
			icon = 'plugins',
			name,
			plan,
			onClick = noop,
			descriptionLink,
		} = this.props;

		const { isUnderMouse } = this.state;

		const isExternalLink = hasHttpProtocol( descriptionLink );

		const target = isExternalLink
			? '_blank'
			: '_self';

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
	descriptionLink: PropTypes.string.isRequired,
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
	onClick: get( props, 'onClick', () => dispatch( trackClick( props.name ) ) )
} );

export default connect( null, mapDispatchToProps )( BusinessPlugin );
