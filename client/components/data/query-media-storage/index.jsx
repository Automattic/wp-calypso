/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingMediaStorage } from 'calypso/state/sites/media-storage/selectors';
import { requestMediaStorage } from 'calypso/state/sites/media-storage/actions';

class QueryMediaStorage extends Component {
	componentDidMount() {
		this.props.requestMediaStorage( this.props.siteId );
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.requestingMediaStorage ||
			! this.props.siteId ||
			this.props.siteId === prevProps.siteId
		) {
			return;
		}

		this.props.requestMediaStorage( this.props.siteId );
	}

	render() {
		return null;
	}
}

QueryMediaStorage.propTypes = {
	siteId: PropTypes.number,
	requestingMediaStorage: PropTypes.bool,
	requestMediaStorage: PropTypes.func,
};

QueryMediaStorage.defaultProps = {
	requestMediaStorage: () => {},
};

const mapStateToProps = ( state, ownProps ) => ( {
	requestingMediaStorage: isRequestingMediaStorage( state, ownProps.siteId ),
} );

export default connect( mapStateToProps, { requestMediaStorage } )( QueryMediaStorage );
