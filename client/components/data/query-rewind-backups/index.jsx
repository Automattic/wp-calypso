/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestRewindBackups } from 'state/rewind/backups/actions';

export class QueryRewindBackups extends Component {
	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			this.request();
		}
	}

	request() {
		const { requestBackups, siteId } = this.props;

		if ( ! siteId ) {
			return;
		}

		requestBackups( siteId );
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = {
	requestBackups: requestRewindBackups,
};

export default connect( null, mapDispatchToProps )( QueryRewindBackups );
