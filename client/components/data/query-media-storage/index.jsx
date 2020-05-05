/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingMediaStorage } from 'state/sites/media-storage/selectors';
import { requestMediaStorage } from 'state/sites/media-storage/actions';
// until we port media over to redux:
import MediaStore from 'lib/media/store';

class QueryMediaStorage extends Component {
	constructor( props ) {
		super( props );
		this.requestStorage = this.requestStorage.bind( this );
	}

	requestStorage( props = this.props ) {
		if ( ! props.requestingMediaStorage && props.siteId ) {
			props.requestMediaStorage( props.siteId );
		}
	}

	UNSAFE_componentWillMount() {
		this.requestStorage();
		MediaStore.on( 'fetch-media-limits', this.requestStorage );
	}

	componentWillUnmount() {
		MediaStore.off( 'fetch-media-limits', this.requestStorage );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			nextProps.requestingMediaStorage ||
			! nextProps.siteId ||
			this.props.siteId === nextProps.siteId
		) {
			return;
		}
		this.requestStorage( nextProps );
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

export default connect(
	( state, ownProps ) => {
		return {
			requestingMediaStorage: isRequestingMediaStorage( state, ownProps.siteId ),
		};
	},
	( dispatch ) => {
		return bindActionCreators(
			{
				requestMediaStorage,
			},
			dispatch
		);
	}
)( QueryMediaStorage );
