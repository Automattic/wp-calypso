/**
 * External dependencies
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';
import LogItem from 'landing/jetpack-cloud/components/log-item';
import ThreatDescription from 'landing/jetpack-cloud/components/threat-description';
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import ThreatItemHeader from 'landing/jetpack-cloud/components/threat-item-header';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

// Either this component is receiving real data or it is not and it should work
// as a placeholder.
interface ThreatsProps {
	threat: Threat;
	isPlaceholder: false;
	moment: Function;
}

interface PlaceholderProps {
	isPlaceholder: true;
	moment: Function;
}

class ScanHistoryItem extends Component< ThreatsProps & PlaceholderProps > {
	entryActionClassNames( threat: Threat ) {
		return {
			'is-fixed': threat.status === 'fixed',
			'is-ignored': threat.status === 'ignored',
		};
	}

	formatDate( date: Date ) {
		return this.props.moment( date ).format( 'LL' );
	}

	getThreatSubHeader( threat: Threat ) {
		return (
			<>
				<div className="scan-history-item__subheader">
					<span className="scan-history-item__date">
						{ translate( 'Threat found on %s', {
							args: this.formatDate( threat.firstDetected ),
						} ) }
					</span>
					{ threat.fixedOn && <span className="scan-history-item__date-separator"></span> }
					{ threat.fixedOn && (
						<span
							className={ classnames(
								'scan-history-item__date',
								this.entryActionClassNames( threat )
							) }
						>
							{ translate( 'Threat %(action)s on %(fixedOn)s', {
								args: { action: threat.status, fixedOn: this.formatDate( threat.fixedOn ) },
							} ) }
						</span>
					) }
				</div>
				<Badge
					className={ classnames(
						'scan-history-item__badge',
						this.entryActionClassNames( threat )
					) }
				>
					<small>{ threat.status }</small>
				</Badge>
			</>
		);
	}

	render() {
		const { threat } = this.props;
		if ( this.props.isPlaceholder ) {
			return (
				<LogItem
					className={ classnames( 'scan-history-item', 'is-placeholder' ) }
					header="Placeholder threat"
					subheader="Placeholder sub header"
				></LogItem>
			);
		}

		return (
			<LogItem
				className={ classnames( 'scan-history-item', this.entryActionClassNames( threat ) ) }
				header={ <ThreatItemHeader threat={ threat } /> }
				subheader={ this.getThreatSubHeader( threat ) }
			>
				<ThreatDescription
					status={ threat.status }
					problem={ threat.description }
					context={ threat.context }
					diff={ threat.diff }
					filename={ threat.filename }
				/>
			</LogItem>
		);
	}
}

export default withLocalizedMoment( ScanHistoryItem );
