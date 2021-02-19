/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPrivacyPolicy } from 'calypso/state/privacy-policy/actions';

export class QueryPrivacyPolicy extends Component {
	static propTypes = {
		requestPrivacyPolicy: PropTypes.func,
	};

	componentDidMount() {
		this.props.requestPrivacyPolicy();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestPrivacyPolicy } )( QueryPrivacyPolicy );
