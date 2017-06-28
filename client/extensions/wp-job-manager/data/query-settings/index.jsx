/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingSettings } from '../../state/settings/selectors';
import { fetchSettings } from '../../state/settings/actions';

class QuerySettings extends Component {
	componentWillMount() {
		this.fetchSettings( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;

		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.fetchSettings( nextProps );
	}

	fetchSettings( props ) {
		const { fetchingSettings, siteId } = props;

		if ( ! fetchingSettings && siteId ) {
			props.fetchSettings( siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySettings.propTypes = {
	siteId: PropTypes.number,
	fetchingSettings: PropTypes.bool,
	fetchSettings: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => ( { fetchingSettings: isFetchingSettings( state, siteId ) } ),
	{ fetchSettings }
)( QuerySettings );
