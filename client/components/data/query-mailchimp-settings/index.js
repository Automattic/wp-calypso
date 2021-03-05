/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSettings } from 'calypso/state/mailchimp/settings/actions';

class QueryMailchimpSettings extends Component {
	componentDidMount() {
		if ( this.props.siteId ) {
			this.props.requestSettings( this.props.siteId );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.props.requestSettings( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestSettings } )( QueryMailchimpSettings );
