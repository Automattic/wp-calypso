/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestComment } from 'calypso/state/comments/actions';

export class QueryComment extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		forceWpcom: PropTypes.bool,
		siteId: PropTypes.number,
	};

	static defaultProps = {
		forceWpcom: false,
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
		const { siteId, commentId, forceWpcom } = this.props;
		if ( siteId && commentId ) {
			const query = forceWpcom ? { force: 'wpcom' } : {};

			this.props.requestComment( { siteId, commentId, query } );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestComment } )( QueryComment );
