/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import CredentialsSetupFlow from './credentials-setup-flow';
import CredentialsConfigured from './credentials-configured';
import Gridicon from 'gridicons';
import QueryRewindStatus from 'components/data/query-rewind-status';
import QueryJetpackCredentials from 'components/data/query-jetpack-credentials';
import { getSelectedSiteId } from 'state/ui/selectors';
import { hasMainCredentials, isRewindActive } from 'state/selectors';

class Backups extends Component {
	static propTypes = {
		hasMainCredentials: PropTypes.bool,
		isRewindActive: PropTypes.bool,
		siteId: PropTypes.number.isRequired,
	};

	render() {
		const {
			hasMainCredentials, // eslint-disable-line no-shadow
			isRewindActive, // eslint-disable-line no-shadow
			translate,
			siteId,
		} = this.props;

		return (
			<div className="jetpack-credentials">
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
				{ isRewindActive && ! hasMainCredentials && <CredentialsSetupFlow siteId={ siteId } /> }
				{ isRewindActive && hasMainCredentials && <CredentialsConfigured siteId={ siteId } /> }
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		hasMainCredentials: hasMainCredentials( state, siteId ),
		isRewindActive: isRewindActive( state, siteId ),
		siteId,
	};
} )( localize( Backups ) );
