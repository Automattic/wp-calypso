/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestList } from 'calypso/state/mailchimp/lists/actions';

class QueryMailchimpLists extends Component {
	componentDidMount() {
		if ( this.props.siteId ) {
			this.props.requestList( this.props.siteId );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.props.requestList( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestList } )( QueryMailchimpLists );
