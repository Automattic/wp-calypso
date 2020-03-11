/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';

class ThreatDescription extends Component {
	static propTypes = {
		action: PropTypes.string,
		details: PropTypes.string,
		fix: PropTypes.string,
		problem: PropTypes.string,
		children: PropTypes.node,
	};

	render() {
		const { children, action, details, problem, fix } = this.props;
		const isThreatFixedOrIgnored = !! action;
		return (
			<div className="threat-description">
				<strong>{ translate( 'What was the problem?' ) }</strong>
				<p>{ problem }</p>
				<strong>
					{ ! isThreatFixedOrIgnored
						? translate( 'How we will fix it?' )
						: translate( 'How did Jetpack fix it?' ) }
				</strong>
				<p>{ fix }</p>
				<strong>{ translate( 'The technical details' ) }</strong>
				<p>{ details }</p>
				{ children }
			</div>
		);
	}
}

export default ThreatDescription;
