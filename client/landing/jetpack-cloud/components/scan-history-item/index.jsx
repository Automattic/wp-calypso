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
		// React complains because we shouldn't wrap a <div> tag inside <p> tag. This happens
		// because LogItem surrounds its content by a <p> tag, and the Badge is a <div> tag.
		// Should we create our own Badge component?
		return (
			<>
				<div className="scan-history-item__subheader">
					<span className="scan-history-item__date">Threat found on { entry.detectionDate }</span>
					<span className="scan-history-item__date-separator"></span>
					<span className={ `scan-history-item__date is-${ entry.action }` }>
						Threat { entry.action } on { entry.actionDate }
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

	renderEntryDetails( entry ) {
		return (
			<div className="scan-history-item__details">
				<strong>{ translate( 'What was the problem?' ) }</strong>
				<p>{ entry.description.problem }</p>
				<strong>{ translate( 'How did Jetpack fix it?' ) }</strong>
				<p>{ entry.description.fix }</p>
				<strong>{ translate( 'The technical details' ) }</strong>
				<p>{ entry.description.details }</p>
			</div>
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
				{ this.renderEntryDetails( entry ) }
			</LogItem>
		);
	}
}

export default ScanHistoryItem;
