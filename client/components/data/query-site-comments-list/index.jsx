/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentsList } from 'calypso/state/comments/actions';

export class QuerySiteCommentsList extends PureComponent {
	static propTypes = {
		listType: PropTypes.string,
		siteId: PropTypes.number,
		status: PropTypes.string,
		type: PropTypes.string,
	};

	static defaultProps = {
		listType: 'site',
		status: 'unapproved',
		type: 'comment',
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate() {
		this.request();
	}

	request() {
		if ( ! this.props.siteId ) {
			return;
		}
		this.props.requestCommentsList( { ...this.props } );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCommentsList } )( QuerySiteCommentsList );
