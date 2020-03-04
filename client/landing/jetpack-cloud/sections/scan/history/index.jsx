/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormattedHeader from 'components/formatted-header';
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
		details: {
			title: 'Unexpected string was found in: /htdocs/wp-admin/index.php',
			description: '',
		},
	},
	{
		id: 2,
		title: 'Infected Plugin: Contact Form 7',
		action: 'ignored',
		detectionDate: '17 September, 2019',
		actionDate: '24 September, 2019',
		details: {
			title:
				'Unexpected file baaaaaad--file.php contains malicious code and is not part of the Plugin',
			description: '',
		},
	},
	{
		id: 3,
		title: 'Infected Plugin: Contact Form 7',
		action: 'ignored',
		detectionDate: '16 September, 2019',
		actionDate: '24 September, 2019',
		details: {
			title:
				'Unexpected file veryBadFile.php contains malicious code and is not part of the Plugin',
			description: '',
		},
	},
	{
		title: 'Infected core file: index.php',
		action: 'fixed',
		detectionDate: '16 September, 2019',
		actionDate: '24 September, 2019',
		details: {
			title: 'Unexpected string was found in: /htdocs/wp-admin/index.php',
			description: '',
		},
	},
	{
		id: 4,
		title: 'Infected Plugin: Classic Editor',
		action: 'ignored',
		detectionDate: '14 September, 2019',
		actionDate: '14 September, 2019',
		details: {
			title:
				'Unexpected file veryBadFile.php contains malicious code and is not part of the Plugin',
			description: '',
		},
	},
];

class ScanHistoryEntry extends Component {
	static propTypes = {
		entry: PropTypes.object,
	};

	renderEntryHeader() {
		const { entry } = this.props;

		const actionClass = 'entry' + entry.action === 'fixed' ? ' is-fixed' : ' is-ignored';

		return (
			<div className={ actionClass }>
				<div className="entry__title">
					<small className="entry__badge">{ entry.action }</small> { entry.title }{ ' ' }
				</div>
				<div className="entry__description">
					<small>Threat found on { entry.detectionDate }</small>–
					<small>
						Threat { entry.action } on { entry.actionDate }
					</small>
				</div>
			</div>
		);
	}

	renderEntryDetails() {
		const { entry } = this.props;

		return <pre>{ JSON.stringify( entry, null, 2 ) }</pre>;
	}

	render() {
		const { entry } = this.props;

		return (
			<FoldableCard
				className="history__entry"
				header={ this.renderEntryHeader() }
				screenReaderText="More"
				key={ entry.id }
			>
				{ this.renderEntryDetails() }
			</FoldableCard>
		);
	}
}

class ScanHistoryPage extends Component {
	handleOnSelect( selection ) {
		// @todo: should we filter in the front end?
		// eslint-disable-next-line no-console
		console.log( selection );
	}

	render() {
		return (
			<section className="history">
				<FormattedHeader className="history__title" headerText="History" />
				<p>The scanning history contains a record of all previously active threats on your site.</p>
				<SimplifiedSegmentedControl
					className="history__filters"
					options={ filterOptions }
					onSelect={ this.handleOnSelect }
				/>
				{ scanEntries.map( entry => (
					<ScanHistoryEntry entry={ entry } key={ entry.id } />
				) ) }
			</section>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( ScanHistoryPage );
