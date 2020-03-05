/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';
import FormattedHeader from 'components/formatted-header';
import LogItem from '../../../components/log-item';
import SimplifiedSegmentedControl from 'components/segmented-control/simplified';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const filterOptions = [
	{ value: 'all', label: 'All' },
	{ value: 'fixed', label: 'Fixed' },
	{ value: 'ignored', label: 'Ignored' },
];

const scanEntries = [
	{
		id: 1,
		title: 'Infected core file: index.php',
		action: 'fixed',
		detectionDate: '23 September, 2019',
		actionDate: '1 October, 2019',
		description: {
			title: 'Unexpected string was found in: /htdocs/wp-admin/index.php',
			problem:
				'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
			fix:
				'To fix this threat, Jetpack deleted the file, since it’s not a part of the original WordPress.',
			details: 'This threat was found in the file: /htdocs/sx--a4bp.php',
		},
	},
	{
		id: 2,
		title: 'Infected Plugin: Contact Form 7',
		action: 'ignored',
		detectionDate: '17 September, 2019',
		actionDate: '24 September, 2019',
		description: {
			title:
				'Unexpected file baaaaaad--file.php contains malicious code and is not part of the Plugin',
			problem:
				'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
			fix:
				'To fix this threat, Jetpack deleted the file, since it’s not a part of the original WordPress.',
			details: 'This threat was found in the file: /htdocs/sx--a4bp.php',
		},
	},
	{
		id: 3,
		title: 'Infected Plugin: Contact Form 7',
		action: 'ignored',
		detectionDate: '16 September, 2019',
		actionDate: '24 September, 2019',
		description: {
			title:
				'Unexpected file veryBadFile.php contains malicious code and is not part of the Plugin',
			problem:
				'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
			fix:
				'To fix this threat, Jetpack deleted the file, since it’s not a part of the original WordPress.',
			details: 'This threat was found in the file: /htdocs/sx--a4bp.php',
		},
	},
	{
		id: 4,
		title: 'Infected core file: index.php',
		action: 'fixed',
		detectionDate: '16 September, 2019',
		actionDate: '24 September, 2019',
		description: {
			title: 'Unexpected string was found in: /htdocs/wp-admin/index.php',
			problem:
				'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
			fix:
				'To fix this threat, Jetpack deleted the file, since it’s not a part of the original WordPress.',
			details: 'This threat was found in the file: /htdocs/sx--a4bp.php',
		},
	},
	{
		id: 5,
		title: 'Infected Plugin: Classic Editor',
		action: 'ignored',
		detectionDate: '14 September, 2019',
		actionDate: '14 September, 2019',
		description: {
			title:
				'Unexpected file veryBadFile.php contains malicious code and is not part of the Plugin',
			problem:
				'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
			fix:
				'To fix this threat, Jetpack deleted the file, since it’s not a part of the original WordPress.',
			details: 'This threat was found in the file: /htdocs/sx--a4bp.php',
		},
	},
];

class ScanHistoryPage extends Component {
	handleOnFilterChange( selection ) {
		// @todo: should we filter in the front end?
		// eslint-disable-next-line no-console
		console.log( selection );
	}

	renderEntryHeader( entry ) {
		// React complains because we shouldn't wrap a <div> tag inside <p> tag. This happens
		// because LogItem surrounds its content by a <p> tag, and the Badge is a <div> tag.
		// Should we create our own Badge component?
		return (
			<>
				<small className="history__entry-date">Threat found on { entry.detectionDate }</small>
				<small className={ `history__entry-date is-${ entry.action }` }>
					Threat { entry.action } on { entry.actionDate }
				</small>
				<Badge
					className="history__entry-badge"
					type={ entry.action === 'fixed' ? 'success' : 'info' }
				>
					<small>{ entry.action }</small>
				</Badge>
			</>
		);
	}

	renderEntryDetails( entry ) {
		return (
			<div className="history__entry-details">
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
		const { logEntries } = this.props;
		return (
			<section className="history">
				<FormattedHeader className="history__title" headerText="History" />
				<p>
					{ translate(
						'The scanning history contains a record of all previously active threats on your site.'
					) }
				</p>
				<SimplifiedSegmentedControl
					className="history__filters"
					options={ filterOptions }
					onSelect={ this.handleOnFilterChange }
				/>
				<div className="history__entries">
					{ logEntries.map( entry => (
						<LogItem
							header={ entry.title }
							subheader={ this.renderEntryHeader( entry ) }
							highlight="success"
							key={ entry.id }
						>
							{ this.renderEntryDetails( entry ) }
						</LogItem>
					) ) }
				</div>
			</section>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	// TODO: Get state from actual API.
	const scanHistoryLogEntries = scanEntries;

	return {
		siteId,
		logEntries: scanHistoryLogEntries,
	};
} )( ScanHistoryPage );
