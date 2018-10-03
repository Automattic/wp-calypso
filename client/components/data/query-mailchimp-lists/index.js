/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestList } from 'state/mailchimp/lists/actions';

class QueryMailchimpLists extends Component {
	componentDidMount() {
		this.props.requestList();
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestList }
)( QueryMailchimpLists );
