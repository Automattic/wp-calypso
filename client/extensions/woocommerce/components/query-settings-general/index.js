/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import {
	areSettingsGeneralLoaded,
	areSettingsGeneralLoadError,
} from 'woocommerce/state/sites/settings/general/selectors';
import { errorNotice, removeNotice } from 'state/notices/actions';

class QuerySettingsGeneral extends Component {
	fetch( siteId ) {
		this.props.actions.fetchSettingsGeneral( siteId );
	}

	showRetryNotice( siteId ) {
		const noticeId = 'query-settings-general-retry';
		this.props.actions.errorNotice(
			this.props.translate( "Some of your site settings couldn't be retrieved." ),
			{
				id: noticeId,
				showDismiss: false,
				button: this.props.translate( 'Try again' ),
				onClick: () => {
					this.fetch( siteId );
					this.props.actions.removeNotice( noticeId );
				},
			}
		);
	}

	UNSAFE_componentWillMount() {
		const { siteId, loaded, error } = this.props;

		if ( siteId ) {
			if ( error ) {
				this.showRetryNotice( siteId );
			} else if ( ! loaded ) {
				this.fetch( siteId );
			}
		}
	}

	UNSAFE_componentWillReceiveProps( { siteId, loaded, error } ) {
		if ( ! siteId ) {
			return;
		}
		if ( ! this.props.error && error ) {
			// just received an error fetching, show the notice to retry
			this.showRetryNotice( siteId );
		} else if ( siteId !== this.props.siteId && ! loaded ) {
			// site ID changed, fetch new zones
			this.fetch( siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySettingsGeneral.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state ) => ( {
		loaded: areSettingsGeneralLoaded( state ),
		error: areSettingsGeneralLoadError( state ),
	} ),
	( dispatch ) => ( {
		actions: bindActionCreators(
			{
				fetchSettingsGeneral,
				errorNotice,
				removeNotice,
			},
			dispatch
		),
	} )
)( localize( QuerySettingsGeneral ) );
