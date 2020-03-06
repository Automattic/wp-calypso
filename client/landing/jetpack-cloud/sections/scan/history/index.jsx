/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import ScanHistoryItem from '../../../components/scan-history-item';
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
	state = {
		filter: filterOptions[ 0 ],
	};

	handleOnFilterChange = filter => {
		// @todo: should we filter in the front end?
		this.setState( {
			filter,
		} );
	};

	filteredEntries() {
		const { logEntries } = this.props;
		const { value: filter } = this.state.filter;
		if ( filter === 'all' ) {
			return logEntries;
		}
		return logEntries.filter( entry => entry.action === filter );
	}

	render() {
		const logEntries = this.filteredEntries();
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
						<ScanHistoryItem entry={ entry } key={ entry.id } />
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
