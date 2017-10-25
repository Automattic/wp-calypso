/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { blur, focus } from 'state/happychat/ui/actions';
import HappychatConnection from 'components/happychat/connection';
import Composer from 'components/happychat/composer';
import Notices from 'components/happychat/notices';
import Timeline from 'components/happychat/timeline';

/**
 * React component for rendering a happychat client as a full page
 */
export class HappychatPage extends Component {
	componentDidMount() {
		this.props.setFocused();
	}

	componentWillUnmount() {
		this.props.setBlurred();
	}

	render() {
		return (
			<div className="happychat__page" aria-live="polite" aria-relevant="additions">
				<HappychatConnection />
				<Timeline />
				<Notices />
				<Composer />
			</div>
		);
	}
}

HappychatPage.propTypes = {
	setBlurred: PropTypes.func,
	setFocused: PropTypes.func,
};

const mapDispatch = {
	setBlurred: blur,
	setFocused: focus,
};

export default connect( null, mapDispatch )( HappychatPage );
