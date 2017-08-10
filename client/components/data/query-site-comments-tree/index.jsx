/** @format */
/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentsTreeForSite } from 'state/comments/actions';

export class QuerySiteCommentsTree extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		status: PropTypes.string,
	};

	static defaultProps = {
		status: 'unapproved',
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( { siteId, status } ) {
		if ( siteId !== this.props.siteId || status !== this.props.status ) {
			this.request();
		}
	}

	request() {
		const { siteId, status } = this.props;
		if ( siteId ) {
			this.props.requestCommentsTreeForSite( { siteId, status } );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCommentsTreeForSite } )( QuerySiteCommentsTree );
