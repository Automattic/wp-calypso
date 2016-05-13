/** @ssr-ready **/

/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchCurrentTheme } from 'state/themes/actions';
import { isRequestingCurrentTheme } from 'state/themes/current-theme/selectors';

class QueryCurrentTheme extends Component {

	componentDidMount() {
		const { requestingCurrentTheme, siteId } = this.props;
		this.refresh( requestingCurrentTheme, siteId );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId === this.props.siteId ) {
			return;
		}
		const { requestingCurrentTheme, siteId } = nextProps;
		this.refresh( requestingCurrentTheme, siteId );
	}

	refresh( requestingCurrentTheme, siteId ) {
		if ( ! requestingCurrentTheme ) {
			this.props.fetchCurrentTheme( siteId );
		}
	}

	render() {
		return null;
	}
}

QueryCurrentTheme.propTypes = {
	siteId: PropTypes.number.isRequired,
	// connected props
	requestingCurrentTheme: PropTypes.bool,
	fetchCurrentTheme: PropTypes.func,
};

export default connect(
	( state, props ) => (
		{ requestingCurrentTheme: isRequestingCurrentTheme( state, props.site && props.site.ID ) }
	),
	{ fetchCurrentTheme }
)( QueryCurrentTheme );
