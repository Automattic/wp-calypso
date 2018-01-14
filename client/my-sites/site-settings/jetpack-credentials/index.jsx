/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import CredentialsSetupFlow from './credentials-setup-flow/index';
import CredentialsConfigured from './credentials-configured/index';
import Gridicon from 'gridicons';
import QueryRewindState from 'components/data/query-rewind-state';
import QueryRewindStatus from 'components/data/query-rewind-status';
import QueryJetpackCredentials from 'components/data/query-jetpack-credentials';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getJetpackCredentials,
	getRewindState,
	hasMainCredentials,
	isRewindActive,
	isUpdatingJetpackCredentials,
} from 'state/selectors';

class Backups extends Component {
	static propTypes = {
		formIsSubmitting: PropTypes.bool,
		hasMainCredentials: PropTypes.bool,
		mainCredentials: PropTypes.object,
		isPressable: PropTypes.bool,
		isRewindActive: PropTypes.bool,
		siteId: PropTypes.number.isRequired,
	};

	render() {
		const {
			formIsSubmitting,
			hasMainCredentials, // eslint-disable-line no-shadow
			isRewindActive, // eslint-disable-line no-shadow
			mainCredentials,
			rewindState,
			siteId,
			translate,
		} = this.props;

		const canAutoconfigure =
			!! rewindState.canAutoconfigure ||
			( rewindState.credentials || [] ).some( cred => cred.type === 'auto' );

		return (
			<div className="jetpack-credentials">
				<QueryRewindState siteId={ this.props.siteId } />
				<QueryRewindStatus siteId={ this.props.siteId } />
				<QueryJetpackCredentials siteId={ this.props.siteId } />
				{ isRewindActive && (
					<CompactCard className="jetpack-credentials__header">
						<span>{ translate( 'Backups and security scans' ) }</span>
						{ hasMainCredentials && (
							<span className="jetpack-credentials__connected">
								<Gridicon
									icon="checkmark"
									size={ 18 }
									className="jetpack-credentials__connected-checkmark"
								/>
								{ translate( 'Connected' ) }
							</span>
						) }
					</CompactCard>
				) }

				{ isRewindActive &&
					! hasMainCredentials && (
						<CredentialsSetupFlow
							{ ...{
								canAutoconfigure,
								formIsSubmitting,
								siteId,
							} }
						/>
					) }

				{ isRewindActive &&
					hasMainCredentials && (
						<CredentialsConfigured
							{ ...{
								canAutoconfigure,
								mainCredentials,
								formIsSubmitting,
								siteId,
							} }
						/>
					) }
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const credentials = getJetpackCredentials( state, siteId, 'main' );

	return {
		formIsSubmitting: isUpdatingJetpackCredentials( state, siteId ),
		hasMainCredentials: hasMainCredentials( state, siteId ),
		mainCredentials: credentials,
		isRewindActive: isRewindActive( state, siteId ),
		rewindState: getRewindState( state, siteId ),
		siteId,
	};
} )( localize( Backups ) );
