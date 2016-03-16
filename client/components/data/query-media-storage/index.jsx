/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingMediaStorage } from 'state/sites/media-storage/selectors';
import { requestMediaStorage } from 'state/sites/media-storage/actions';

class QueryMediaStorage extends Component {
	componentWillMount() {
		if ( ! this.props.requestingMediaStorage && this.props.siteId ) {
			this.props.requestMediaStorage( this.props.siteId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestingMediaStorage ||
			! nextProps.siteId ||
			( this.props.siteId === nextProps.siteId ) ) {
			return;
		}

		nextProps.requestMediaStorage( nextProps.siteId );
	}

	render() {
		return null;
	}
}

QueryMediaStorage.propTypes = {
	siteId: PropTypes.number,
	requestingMediaStorage: PropTypes.bool,
	requestMediaStorage: PropTypes.func
};

QueryMediaStorage.defaultProps = {
	requestMediaStorage: () => {}
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingMediaStorage: isRequestingMediaStorage( state, ownProps.siteId )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestMediaStorage
		}, dispatch );
	}
)( QueryMediaStorage );
