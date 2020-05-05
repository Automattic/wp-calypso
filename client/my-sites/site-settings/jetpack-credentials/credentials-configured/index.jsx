/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import getRewindState from 'state/selectors/get-rewind-state';
import Gridicon from 'components/gridicon';
import QuerySitePurchases from 'components/data/query-site-purchases';
import RewindCredentialsForm from 'components/rewind-credentials-form';
import siteSupportsRealtimeBackup from 'state/selectors/site-supports-realtime-backup';
import { CompactCard, Button } from '@automattic/components';
import { deleteCredentials } from 'state/jetpack/credentials/actions';

/**
 * Style dependencies
 */
import './style.scss';

class CredentialsConfigured extends Component {
	state = {
		isRevoking: false,
		isDeletingCreds: false,
	};

	handleRevoke = () =>
		this.setState( { isDeletingCreds: true }, () =>
			this.props.deleteCredentials( this.props.siteId, 'main' )
		);

	toggleRevoking = () => this.setState( { isRevoking: ! this.state.isRevoking } );

	render() {
		const { canAutoconfigure, siteId, supportsRealtimeBackup, translate } = this.props;

		const isRevoking = this.state.isRevoking;

		if ( isRevoking ) {
			return (
				<CompactCard className="credentials-configured">
					<p>
						{ translate(
							"Your site's server was automatically connected to Jetpack to " +
								'perform backups, restores, and security scans. You do not have to ' +
								'configure anything further, but you may revoke the credentials if necessary.'
						) }
					</p>
					<div className="credentials-configured__revoke-actions">
						<Button
							className="credentials-configured__revoke-button"
							borderless
							onClick={ this.handleRevoke }
							scary
							disabled={ this.state.isDeletingCreds }
						>
							<Gridicon
								className="credentials-configured__revoke-icon"
								icon="link-break"
								size={ 18 }
							/>
							{ translate( 'Revoke credentials' ) }
						</Button>
						<Button primary onClick={ this.toggleRevoking }>
							{ translate( 'Stay connected' ) }
						</Button>
					</div>
				</CompactCard>
			);
		}

		if ( canAutoconfigure ) {
			return (
				<CompactCard className="credentials-configured" onClick={ this.toggleRevoking } href="#">
					<div className="credentials-configured__info">
						<Gridicon
							icon="checkmark-circle"
							size={ 48 }
							className="credentials-configured__info-gridicon"
						/>
						<div className="credentials-configured__info-text">
							{ translate( 'Backups and security scans are configured and active.' ) }
						</div>
					</div>
				</CompactCard>
			);
		}

		const headerText = supportsRealtimeBackup
			? translate(
					'Your site is being backed up in real time and regularly scanned for security threats.'
			  )
			: translate(
					'Your site is being backed up every day and regularly scanned for security threats.'
			  );

		const header = (
			<div className="credentials-configured__info">
				<Gridicon
					icon="checkmark-circle"
					size={ 48 }
					className="credentials-configured__info-gridicon"
				/>
				<div className="credentials-configured__info-text">
					<h3 className="credentials-configured__info-protocol">{ translate( 'Connected' ) }</h3>
					<h4 className="credentials-configured__info-description">{ headerText }</h4>
				</div>
			</div>
		);

		return (
			<FoldableCard header={ header } className="credentials-configured">
				<QuerySitePurchases siteId={ siteId } />

				<RewindCredentialsForm
					{ ...{
						role: 'main',
						siteId,
						allowCancel: false,
						allowDelete: true,
					} }
				/>
			</FoldableCard>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => {
	const { canAutoconfigure, credentials = [] } = getRewindState( state, siteId );

	return {
		canAutoconfigure: canAutoconfigure || credentials.some( ( c ) => c.type === 'auto' ), // eslint-disable-line wpcalypso/redux-no-bound-selectors
		mainCredentials: find( credentials, { role: 'main' } ),
		supportsRealtimeBackup: siteSupportsRealtimeBackup( state, siteId ),
	};
};

export default connect( mapStateToProps, { deleteCredentials } )(
	localize( CredentialsConfigured )
);
