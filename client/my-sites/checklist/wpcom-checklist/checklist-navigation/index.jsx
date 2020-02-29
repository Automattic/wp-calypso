/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import isSiteChecklistLoading from 'state/selectors/is-site-checklist-loading';

/**
 * Style dependencies
 */
import './style.scss';

export class ChecklistNavigation extends Component {
	static propTypes = {
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
	};

	render() {
		const { isLoading, translate, taskList } = this.props;
		const { total, completed } = taskList.getCompletionStatus();

		if ( total === completed || isLoading ) {
			return null;
		}

		return (
			<div className="checklist-navigation">
				<span className="checklist-navigation__label">{ translate( 'Finish setup' ) }</span>

				<div className="checklist-navigation__progress-bar-margin">
					<ProgressBar total={ total } value={ completed } compact />
				</div>
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			siteSlug: getSiteSlug( state, siteId ),
			isLoading: isSiteChecklistLoading( state, siteId ),
		};
	},
	{ recordTracksEvent }
)( localize( ChecklistNavigation ) );
