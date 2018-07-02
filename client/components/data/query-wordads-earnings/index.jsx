/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingWordadsEarnings } from 'state/wordads/earnings/selectors';
import { requestWordadsEarnings } from 'state/wordads/earnings/actions';

class QueryWordadsEarnings extends Component {
	static propTypes = {
		isRequestingWordadsEarnings: PropTypes.bool,
		requestWordadsEarnings: PropTypes.func,
		siteId: PropTypes.number,
	};

	static defaultProps = {
		requestWordadsEarnings: () => {},
	};

	componentDidMount() {
		this.props.requestWordadsEarnings( this.props.siteId );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.props.requestWordadsEarnings( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, props ) => ( {
		isRequestingWordadsEarnings: isRequestingWordadsEarnings( state, props.siteId ),
	} ),
	{ requestWordadsEarnings }
)( QueryWordadsEarnings );
