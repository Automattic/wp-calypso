/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';
import LogItem from '../log-item';
import ThreatDescription from '../threat-description';

/**
 * Style dependencies
 */
import './style.scss';

class ScanHistoryItem extends Component {
	static propTypes = {
		object: PropTypes.object,
	};

	entryActionClassNames( entry ) {
		return {
			'is-fixed': entry.action === 'fixed',
			'is-ignored': entry.action === 'ignored',
		};
	}

	renderEntryHeader( entry ) {
		return (
			<>
				<div className="scan-history-item__subheader">
					<span className="scan-history-item__date">
						{ translate( 'Threat found on %s', { args: entry.detectionDate } ) }
					</span>
					<span className="scan-history-item__date-separator"></span>
					<span
						className={ classnames(
							'scan-history-item__date',
							this.entryActionClassNames( entry )
						) }
					>
						{ translate( 'Threat %(action)s on %(actionDate)s', {
							args: { action: entry.action, actionDate: entry.actionDate },
						} ) }
					</span>
				</div>
				<Badge
					className={ classnames(
						'scan-history-item__badge',
						this.entryActionClassNames( entry )
					) }
				>
					<small>{ entry.action }</small>
				</Badge>
			</>
		);
	}

	render() {
		const { entry } = this.props;

		return (
			<LogItem
				className={ classnames( 'scan-history-item', this.entryActionClassNames( entry ) ) }
				header={ entry.title }
				subheader={ this.renderEntryHeader( entry ) }
				key={ entry.id }
			>
				<ThreatDescription
					className="scan-history-item__details"
					action={ entry.action }
					details={ entry.description.details }
					fix={ entry.description.fix }
					problem={ entry.description.problem }
				/>
			</LogItem>
		);
	}
}

export default ScanHistoryItem;
