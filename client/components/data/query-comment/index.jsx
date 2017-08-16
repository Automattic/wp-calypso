/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestComment } from 'state/comments/actions';

export class QueryComment extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		context: PropTypes.string,
		siteId: PropTypes.number,
	};

	static defaultProps = {
		context: 'display',
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
		const { siteId, commentId, context } = this.props;
		if ( siteId && commentId ) {
			this.props.requestComment( {
				siteId,
				commentId,
				query: { context },
			} );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestComment } )( QueryComment );
