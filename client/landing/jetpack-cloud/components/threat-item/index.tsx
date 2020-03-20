/**
 * External dependencies
 */
import React, { Component } from 'react';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	threat: Threat;
	onFixThreat: Function;
	onIgnoreThreat: Function;
}

class ThreatItem extends Component< Props > {
	/**
	 * Render a CTA button. Currently, this button is rendered three
	 * times: in the details section, and in the `summary` and `extendSummary`
	 * sections of the header.
	 *
	 * @param {string} className A class for the button
	 */
	renderFixThreatButton( className ) {
		return (
			<Button
				className={ classnames( 'threat-item__fix-button', className ) }
				compact
				onClick={ this.props.onFixThreat }
			>
				{ translate( 'Fix threat' ) }
			</Button>
		);
	}

	render() {
		const { threat, onIgnoreThreat } = this.props;
		const fixThreatCTA = this.renderFixThreatButton( 'is-summary' );

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
				<ThreatDescription
					action={ threat.action }
					details={ threat.description.details }
					fix={ threat.description.fix }
					problem={ threat.description.problem }
				/>

				<div className="threat-item__buttons">
					{ this.renderFixThreatButton( 'is-details' ) }
					<Button className="threat-item__ignore-button" compact onClick={ onIgnoreThreat }>
						{ translate( 'Ignore threat' ) }
					</Button>
				</div>
			</LogItem>
		);
	}
}

export default ThreatItem;
