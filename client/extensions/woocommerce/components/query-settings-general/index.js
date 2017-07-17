/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { areSettingsGeneralLoaded, areSettingsGeneralLoadError } from 'woocommerce/state/sites/settings/general/selectors';
import { errorNotice, removeNotice } from 'state/notices/actions';

class QuerySettingsGeneral extends Component {
	fetch( siteId ) {
		this.props.actions.fetchSettingsGeneral( siteId );
	}

	componentWillMount() {
		const { siteId, loaded } = this.props;

		if ( siteId && ! loaded ) {
			this.fetch( siteId );
		}
	}

	componentWillReceiveProps( { siteId, loaded, error, translate } ) {
		if ( siteId !== this.props.siteId && ! loaded ) {
			// site ID changed, fetch new zones
			this.fetch( siteId );
		} else if ( ! this.props.error && error ) {
			// just received an error fetching, show the notice to retry
			const noticeId = uniqueId();
			this.props.actions.errorNotice( translate( 'Some of your site settings couldn\'t be retrieved.' ), {
				id: noticeId,
				showDismiss: false,
				button: translate( 'Try again' ),
				onClick: () => {
					this.fetch( siteId );
					this.props.actions.removeNotice( noticeId );
				}
			} );
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
			}, dispatch
		)
	} ) )( localize( QuerySettingsGeneral ) );
