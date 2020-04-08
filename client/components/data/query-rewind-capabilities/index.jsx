/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestRewindCapabilities } from 'state/rewind/capabilities/actions';

export class QueryRewindCapabilities extends Component {
	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			this.request();
		}
	}

	request() {
		const { requestCapabilities, siteId } = this.props;

		if ( ! siteId ) {
			return;
		}

		requestCapabilities( siteId );
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = {
	requestCapabilities: requestRewindCapabilities,
};

export default connect( null, mapDispatchToProps )( QueryRewindCapabilities );
