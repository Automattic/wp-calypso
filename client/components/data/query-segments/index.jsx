/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSegments } from 'state/signup/segments/actions';
import { getSegments } from 'state/signup/segments/selectors';

export class QuerySegments extends Component {
	static propTypes = {
		requestSegments: PropTypes.func,
		segments: PropTypes.array,
	};

	UNSAFE_componentWillMount() {
		if ( ! this.props.segments ) {
			this.props.requestSegments();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		segments: getSegments( state ),
	} ),
	{ requestSegments }
)( QuerySegments );
