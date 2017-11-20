/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */

import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteChecklist } from 'state/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';

class Show extends PureComponent {
	render() {
		const { siteId, siteChecklist } = this.props;
		let completedTaskCount = 0;
		let taskCount = 0;
		let text = '';

		if ( siteChecklist && siteChecklist.tasks ) {
			forEach( siteChecklist.tasks, value => {
				if ( value ) {
					completedTaskCount += 1;
				}
				taskCount += 1;
			} );
			text = `${ completedTaskCount } of ${ taskCount } tasks completed`;
		}

		return (
			<p>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ text }
			</p>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const siteChecklist = getSiteChecklist( state, siteId );
	return { siteId, siteChecklist };
};
const mapDispatchToProps = null;

export default connect( mapStateToProps, mapDispatchToProps )( localize( Show ) );
