/**
 * External dependencies
 */
import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingThemeDetails } from 'state/themes/theme-details/selectors';
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
		if ( props.id && ! props.requestingThemeDetails ) {
			this.props.fetchThemeDetails( props.id, props.siteId );
		}
	}

	render() {
		return null;
	}
}

QueryThemeDetails.propTypes = {
	id: PropTypes.string.isRequired,
	siteId: PropTypes.number,
	// connected props
	requestingThemeDetails: PropTypes.bool,
	fetchThemeDetails: PropTypes.func,
};

export default connect(
	( state, { id } ) => (
		{ requestingThemeDetails: isRequestingThemeDetails( state, id ) }
	),
	{ fetchThemeDetails }
)( QueryThemeDetails );
