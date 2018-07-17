/** @format */

/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import JetpackChecklist from '../jetpack-checklist';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import OnboardingChecklist from '../onboardingChecklist';

class ChecklistShow extends PureComponent {
	static propTypes = {
		isJetpack: PropTypes.bool,
		siteId: PropTypes.number,
	};

	render() {
		const { isJetpack, siteId } = this.props;

		const Checklist = isJetpack ? JetpackChecklist : OnboardingChecklist;

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ siteId && (
					<Checklist key={ siteId /* force remount on siteId change */ } siteId={ siteId } />
				) }
			</Fragment>
		);
	}
}
function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	return {
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
	};
}

export default connect( mapStateToProps )( ChecklistShow );
