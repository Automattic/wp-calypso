/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSettings } from 'state/mailchimp/settings/actions';

class QueryMailchimpSettings extends Component {
	componentDidMount() {
		this.props.requestSettings();
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestSettings }
)( QueryMailchimpSettings );
