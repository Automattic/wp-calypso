/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteChecklist } from 'state/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';

class Show extends PureComponent {
	render() {
		const { siteId, siteChecklist, translate } = this.props;
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
			<Main>
				<DocumentHead title={ translate( 'Site Checklist' ) } />
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ text }
			</Main>
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
