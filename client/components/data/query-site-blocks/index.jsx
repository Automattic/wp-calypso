/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteBlocks } from 'calypso/state/reader/site-blocks/actions';

class QuerySiteBlocks extends Component {
	static propTypes = {
		page: PropTypes.number,
	};

	static defaultProps = {
		page: 1,
	};

	componentDidMount() {
		this.props.requestSiteBlocks( { page: this.props.page } );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.page !== prevProps.page ) {
			this.props.requestSiteBlocks( { page: this.props.page } );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestSiteBlocks } )( QuerySiteBlocks );
