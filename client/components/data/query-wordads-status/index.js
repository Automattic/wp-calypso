/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingWordadsStatus } from 'state/wordads/status/selectors';
import { requestWordadsStatus } from 'state/wordads/status/actions';

class QueryWordadsStatus extends Component {
	componentWillMount() {
		this.refreshSite( this.props.siteId );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.refreshSite( nextProps.siteId );			
		}
	}

	refreshSite( siteId ) {
		if ( ! this.props.isRequestingWordadsStatus ) {
			this.props.requestWordadsStatus( siteId );
		}		
	}

	render() {
		return null;
	}
}

QueryWordadsStatus.propTypes = {
	isRequestingWordadsStatus: PropTypes.bool,
	requestWordadsStatus: PropTypes.func,
	siteId: PropTypes.number
};

QueryWordadsStatus.defaultProps = {
	requestWordadsStatus: () => {}
};

export default connect(
	( state, props ) => ( {
		isRequestingWordadsStatus: isRequestingWordadsStatus( state, props.siteId )
	} ),
	{ requestWordadsStatus }
)( QueryWordadsStatus );
