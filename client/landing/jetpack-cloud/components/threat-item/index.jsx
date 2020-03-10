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

	// This is almost equal to the details of a fixed/ignored threat event,
	// so we may have to abstract it into its own component
	renderEntryDetails( threat ) {
		return (
			<div className="threat-item__details">
				<strong>{ translate( 'What was the problem?' ) }</strong>
				<p>{ threat.description.problem }</p>
				<strong>{ translate( 'How we will fix it?' ) }</strong>
				<p>{ threat.description.fix }</p>
				<strong>{ translate( 'The technical details' ) }</strong>
				<p>{ threat.description.details }</p>
				{ this.renderFixThreatCTA( 'is-details' ) }
			</div>
		);
	}

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
				{ this.renderEntryDetails( threat ) }
			</LogItem>
		);
	}
}

export default ThreatItem;
