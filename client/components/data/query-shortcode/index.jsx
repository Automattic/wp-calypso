/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingShortcode } from 'state/shortcodes/selectors';
import { fetchShortcode } from 'state/shortcodes/actions';

class QueryShortcode extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		shortcode: PropTypes.string.isRequired,
		requestingShortcode: PropTypes.bool,
		fetchShortcode: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId || this.props.shortcode !== nextProps.shortcode ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingShortcode ) {
			return;
		}

		props.fetchShortcode( props.siteId, props.shortcode );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingShortcode: isRequestingShortcode( state, ownProps.siteId, ownProps.shortcode )
		};
	},
	{ fetchShortcode }
)( QueryShortcode );
