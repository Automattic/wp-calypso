/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import Card from 'components/card';
import Checklist from 'components/checklist';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteChecklist } from 'state/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';

class ChecklistShow extends PureComponent {
	render() {
		const { siteId, translate } = this.props;

		return (
			<Main>
				<DocumentHead title={ translate( 'Site Checklist' ) } />
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<Card>
					<h1 className="checklist-show__header-heading">{ translate( 'Welcome back!' ) }</h1>
					<h2 className="checklist-show__header-text">
						{ translate( "Let's get your site ready for its debut with a few quick setup steps" ) }
					</h2>
					<Checklist placeholderCount={ 5 } />
				</Card>
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( ChecklistShow ) );
