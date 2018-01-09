/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import CredentialsSetupFlow from './credentials-setup-flow/index';
import CredentialsConfigured from './credentials-configured/index';
import Gridicon from 'gridicons';
import QueryJetpackCredentials from 'components/data/query-jetpack-credentials';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getJetpackCredentials,
	isUpdatingJetpackCredentials,
	hasMainCredentials,
	isSitePressable,
	getCredentialsAutoConfigStatus
} from 'state/selectors';
import {
	updateCredentials,
	autoConfigCredentials,
	deleteCredentials,
} from 'state/jetpack/credentials/actions';
import ActivityLogRewindToggle from 'my-sites/stats/activity-log/activity-log-rewind-toggle';

class Backups extends Component {
	static propTypes = {
		rewindStatus: PropTypes.string,
		autoConfigStatus: PropTypes.string,
		formIsSubmitting: PropTypes.bool,
		hasMainCredentials: PropTypes.bool,
		mainCredentials: PropTypes.object,
		isPressable: PropTypes.bool,
		siteId: PropTypes.number.isRequired
	};

	getCredentialsForm() {
		const {
			autoConfigStatus,
			rewindStatus,
			hasMainCredentials, // eslint-disable-line no-shadow
			isPressable,
			formIsSubmitting,
			updateCredentials,
			siteId,
			autoConfigCredentials, // eslint-disable-line no-shadow
		} = this.props;
		return 'active' === rewindStatus && hasMainCredentials
			? <CredentialsConfigured { ...this.props } />
			: <CredentialsSetupFlow { ...{
				isPressable,
				formIsSubmitting,
				siteId,
				updateCredentials,
				autoConfigCredentials,
				autoConfigStatus,
			} } />;
	}

	render() {
		const {
			siteId,
			hasMainCredentials, // eslint-disable-line no-shadow
			rewindStatus,
			translate,
		} = this.props;
		const isRewindActive = 'active' === rewindStatus;
		const validStates = [ 'active', 'awaitingCredentials', 'provisioning' ];
		const rewindStarted = includes( validStates, rewindStatus );
		const rewindNotStarted = ! rewindStarted;

		return (
			<div className="jetpack-credentials">
				<QueryJetpackCredentials siteId={ siteId } />
				<CompactCard className="jetpack-credentials__header">
					<span>{ translate( 'Backups and security scans' ) }</span>
					{
						isRewindActive && hasMainCredentials && (
							<span className="jetpack-credentials__connected">
								<Gridicon icon="checkmark" size={ 18 } className="jetpack-credentials__connected-checkmark" />
								{ translate( 'Connected' ) }
							</span>
						)
					}
					{
						rewindNotStarted && <ActivityLogRewindToggle siteId={ siteId } />
					}
				</CompactCard>
				{
					rewindStarted && this.getCredentialsForm()
				}
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const credentials = getJetpackCredentials( state, siteId, 'main' );

		return {
			autoConfigStatus: getCredentialsAutoConfigStatus( state, siteId ),
			formIsSubmitting: isUpdatingJetpackCredentials( state, siteId ),
			hasMainCredentials: hasMainCredentials( state, siteId ),
			mainCredentials: credentials,
			isPressable: isSitePressable( state, siteId ),
			siteId,
		};
	}, {
		autoConfigCredentials,
		updateCredentials,
		deleteCredentials,
	}
)( localize( Backups ) );
