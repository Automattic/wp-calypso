/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentsTreeForSite } from 'calypso/state/comments/actions';

export class QuerySiteCommentsTree extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		status: PropTypes.string,
	};

	static defaultProps = {
		status: 'all',
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
			if ( 'all' !== status ) {
				return this.props.requestCommentsTreeForSite( { siteId, status } );
			}
			this.props.requestCommentsTreeForSite( { siteId, status: 'approved' } );
			this.props.requestCommentsTreeForSite( { siteId, status: 'unapproved' } );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCommentsTreeForSite } )( QuerySiteCommentsTree );
