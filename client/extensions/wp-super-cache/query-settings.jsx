/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSettings } from './state/selectors';
import { requestSettings } from './state/actions';

class QuerySettings extends Component {
	componentWillMount() {
		this.requestSettings( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;

		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.requestSettings( nextProps );
	}

	requestSettings( props ) {
		const { requestingSettings, siteId } = props;

		if ( ! requestingSettings && siteId ) {
			props.requestSettings( siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySettings.propTypes = {
	siteId: PropTypes.number,
	requestingSettings: PropTypes.bool,
	requestSettings: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSettings: isRequestingSettings( state, siteId ),
		};
	},
	{ requestSettings }
)( QuerySettings );
