/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestComment } from 'state/comments/actions';

export class QueryComment extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		siteId: PropTypes.number,
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( { siteId, commentId } ) {
		if ( siteId !== this.props.siteId || commentId !== this.props.commentId ) {
			this.request();
		}
	}

	request() {
		const { siteId, commentId } = this.props;
		if ( siteId && commentId ) {
			this.props.requestComment( { siteId, commentId } );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestComment } )( QueryComment );
