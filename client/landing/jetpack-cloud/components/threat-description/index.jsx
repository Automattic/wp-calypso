/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

class ThreatDescription extends Component {
	static propTypes = {
		threat: PropTypes.object,
	};

	render() {
		const { children, threat } = this.props;
		const isThreatFixedOrIgnored = !! threat.action;
		return (
			<div className="threat-description">
				<strong>{ translate( 'What was the problem?' ) }</strong>
				<p>{ threat.description.problem }</p>
				<strong>
					{ ! isThreatFixedOrIgnored
						? translate( 'How we will fix it?' )
						: translate( 'How did Jetpack fix it?' ) }
				</strong>
				<p>{ threat.description.fix }</p>
				<strong>{ translate( 'The technical details' ) }</strong>
				<p>{ threat.description.details }</p>
				{ children }
			</div>
		);
	}
}

export default ThreatDescription;
