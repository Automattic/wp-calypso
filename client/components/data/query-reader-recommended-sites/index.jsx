/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestRecommendedSites } from 'calypso/state/reader/recommended-sites/actions';

class QueryReaderRecommendedSites extends Component {
	static propTypes = {
		seed: PropTypes.number,
		offset: PropTypes.number,
	};

	static defaultProps = {
		seed: 0,
		offset: 0,
	};

	UNSAFE_componentWillMount() {
		this.props.requestRecommendedSites( { seed: this.props.seed, offset: this.props.offset } );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.props.requestRecommendedSites( { seed: nextProps.seed, offset: nextProps.offset } );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestRecommendedSites } )( QueryReaderRecommendedSites );
