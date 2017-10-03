/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
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
	( state, { siteId, shortcode } ) => ( {
		requestingShortcode: isRequestingShortcode( state, siteId, shortcode )
	} ),
	{ fetchShortcode }
)( QueryShortcode );
