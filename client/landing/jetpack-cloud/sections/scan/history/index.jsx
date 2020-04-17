/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import QueryJetpackScanHistory from 'components/data/query-jetpack-scan-history';
import ScanHistoryItem from '../../../components/scan-history-item';
import SimplifiedSegmentedControl from 'components/segmented-control/simplified';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';

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
	getCurrentFilter = () => {
		const { filter } = this.props;

		if ( filter ) {
			return filterOptions.find( ( { value } ) => value === filter ) || filterOptions[ 0 ];
		}
		return filterOptions[ 0 ];
	};

	handleOnFilterChange = filter => {
		const { siteSlug } = this.props;
		let filterValue = filter.value;
		if ( 'all' === filterValue ) {
			filterValue = '';
		}
		page.show( `/scan/history/${ siteSlug }/${ filterValue }` );
	};

	filteredEntries() {
		const { logEntries } = this.props;
		const { value: filter } = this.getCurrentFilter();
		if ( filter === 'all' ) {
			return logEntries;
		}
		return logEntries.filter( entry => entry.action === filter );
	}

	render() {
		const logEntries = this.filteredEntries();
		const { value: filter } = this.getCurrentFilter();
		return (
			<Main className="history">
				<QueryJetpackScanHistory siteId={ this.props.siteId } />
				<DocumentHead title={ translate( 'History' ) } />
				<SidebarNavigation />
				<h1 className="history__header">{ translate( 'History' ) }</h1>
				<p className="history__description">
					{ translate(
						'The scanning history contains a record of all previously active threats on your site.'
					) }
				</p>
				<div className="history__filters-wrapper">
					<SimplifiedSegmentedControl
						className="history__filters"
						options={ filterOptions }
						onSelect={ this.handleOnFilterChange }
						initialSelected={ filter }
					/>
				</div>
				<div className="history__entries">
					{ logEntries.map( entry => (
						<ScanHistoryItem entry={ entry } key={ entry.id } />
					) ) }
				</div>
			</Main>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	// TODO: Get state from actual API.
	const scanHistoryLogEntries = scanEntries;

	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		logEntries: scanHistoryLogEntries,
	};
} )( ScanHistoryPage );
