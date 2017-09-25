/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteUpdates } from 'state/sites/updates/selectors';
import { requestSiteUpdates as requestUpdates } from 'state/sites/updates/utils';

class QuerySiteUpdates extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		requestingSiteUpdates: PropTypes.bool,
		requestUpdates: PropTypes.func
	};

	static defaultProps = {
		requestUpdates: () => {}
	};

	constructor( props ) {
		super( props );
		this.requestUpdates = this.requestUpdates.bind( this );
	}

	componentWillMount() {
		this.requestUpdates();
	}

	componentWillReceiveProps( nextProps ) {
		if (
			nextProps.requestingSiteUpdates ||
			! nextProps.siteId ||
			( this.props.siteId === nextProps.siteId )
		) {
			return;
		}

		this.requestUpdates( nextProps );
	}

	requestUpdates( props = this.props ) {
		if ( ! props.requestingSiteUpdates && props.siteId ) {
			props.requestUpdates( props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingSiteUpdates: isRequestingSiteUpdates( state, ownProps.siteId )
		};
	},
	{ requestUpdates }
)( QuerySiteUpdates );
