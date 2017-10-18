/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { fetchSettings } from 'woocommerce/woocommerce-services/state/label-settings/actions';
import {
	areSettingsLoaded,
	areSettingsFetching,
	areSettingsErrored,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class QueryLabelSettings extends Component {
	fetch( props ) {
		const { siteId, loaded, fetching, error } = props;
		if ( ! loaded && ! fetching && ! error ) {
			this.props.fetchSettings( siteId );
		}
	}

	componentWillMount() {
		this.fetch( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.fetch( nextProps );
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
		loaded: areSettingsLoaded( state ),
		fetching: areSettingsFetching( state ),
		error: areSettingsErrored( state ),
	} ),
	( dispatch ) => bindActionCreators( {
		fetchSettings,
	}, dispatch )
)( QueryLabelSettings );
