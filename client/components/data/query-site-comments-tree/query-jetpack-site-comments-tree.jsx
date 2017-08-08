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
		page: PropTypes.number,
		siteId: PropTypes.number,
		status: PropTypes.string,
	};

	static defaultProps = {
		page: 1,
		status: 'unapproved',
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( { page, siteId, status } ) {
		const pageChange = page !== this.props.page;
		const statusChange = status !== this.props.status;

		if ( pageChange || statusChange || siteId !== this.props.siteId ) {
			this.request( ( pageChange && ! statusChange ) ? 'add' : 'replace' );
		}
	}

	request( strategy = 'replace' ) {
		const { page, siteId, status } = this.props;
		if ( siteId ) {
			this.props.requestCommentsTreeForJetpackSite( { page, siteId, status, strategy } );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCommentsTreeForJetpackSite } )( QueryJetpackSiteCommentsTree );
