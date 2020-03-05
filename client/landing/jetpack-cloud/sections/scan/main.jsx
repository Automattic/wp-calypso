/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import { getSelectedSiteId } from 'state/ui/selectors';

class ScanPage extends Component {
	render() {
		return (
			<div>
				Welcome to the scan page for site { this.props.siteId }
				<StatsFooter
					header="Scan Summary"
					stats={ [
						{ name: 'Files', number: 1201 },
						{ name: 'Plugins', number: 4 },
						{ name: 'Themes', number: 3 },
					] }
					noticeText="Failing to plan is planning to fail. Regular backups ensure that should the worst happen, you are prepared. Jetpack Backups has you covered."
					noticeLink="https://jetpack/upgrade/backups"
				/>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( ScanPage );
