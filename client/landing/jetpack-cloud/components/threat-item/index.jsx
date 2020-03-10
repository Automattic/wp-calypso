/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';

/**
 * Style dependencies
 */
import './style.scss';

class ThreatItem extends Component {
	static propTypes = {
		threat: PropTypes.object,
	};

	handleFixThreat = () => {
		const { threat } = this.props;
		// eslint-disable-next-line no-undef
		alert( `Fixing threat ${ threat.id }` );
	};

	/**
	 * Render a CTA button. Currently, this button is rendered three
	 * times: in the details section, and in the `summary` and `extendSummary`
	 * sections of the header.
	 *
	 * @param {string} className A class for the button
	 */
	renderFixThreatCTA( className ) {
		return (
			<Button
				className={ classnames( 'threat-item__fix-cta', className ) }
				compact
				onClick={ this.handleFixThreat }
			>
				{ translate( 'Fix threat' ) }
			</Button>
		);
	}

	render() {
		const { threat } = this.props;
		const fixThreatCTA = this.renderFixThreatCTA( 'is-summary' );

		return (
			<LogItem
				className="threat-item"
				header={ threat.title }
				subheader={ threat.description.title }
				summary={ fixThreatCTA }
				expandedSummary={ fixThreatCTA }
				key={ threat.id }
				highlight="error"
			>
				<ThreatDescription threat={ threat }>
					{ this.renderFixThreatCTA( 'is-details' ) }
				</ThreatDescription>
			</LogItem>
		);
	}
}

export default ThreatItem;
