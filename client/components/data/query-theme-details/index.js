/** @ssr-ready **/

/**
 * External dependencies
 */
import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchThemeDetails } from 'state/themes/actions';

/**
 * Fetches details for a theme specified by its ID
 * and passes it to the supplied child component.
 */
class QueryThemeDetails extends Component {

	componentDidMount() {
		this.refresh( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.id && nextProps.id !== this.props.id ) {
			this.refresh( nextProps );
		}
	}

	refresh( props ) {
		// todo (seear): Don't fetch if site matches existing data
		if ( props.id ) {
			this.props.fetchThemeDetails( props.id, props.siteId );
		}
	}

	render() {
		return null;
	}
}

QueryThemeDetails.propTypes = {
	id: PropTypes.string.isRequired,
	// connected props
	fetchThemeDetails: PropTypes.func,
};

export default connect(
	null,
	{ fetchThemeDetails }
)( QueryThemeDetails );
