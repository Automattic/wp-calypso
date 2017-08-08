/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentsTreeForJetpackSite } from 'state/comments/actions';

export class QueryJetpackSiteCommentsTree extends Component {
	static propTypes = {
		offset: PropTypes.number,
		siteId: PropTypes.number,
		status: PropTypes.string,
	};

	static defaultProps = {
		offset: 0,
		status: 'unapproved',
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( { offset, siteId, status } ) {
		if ( offset !== this.props.offset || siteId !== this.props.siteId || status !== this.props.status ) {
			this.request();
		}
	}

	request() {
		const { offset, siteId, status } = this.props;
		if ( siteId ) {
			this.props.requestCommentsTreeForJetpackSite( { offset, siteId, status } );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCommentsTreeForJetpackSite } )( QueryJetpackSiteCommentsTree );
