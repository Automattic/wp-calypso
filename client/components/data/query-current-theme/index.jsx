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
		const { requestingCurrentTheme, site } = this.props;
		this.refresh( requestingCurrentTheme, site );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.site === this.props.site ) {
			return;
		}
		const { requestingCurrentTheme, site } = nextProps;
		this.refresh( requestingCurrentTheme, site );
	}

	refresh( requestingCurrentTheme, site ) {
		if ( ! requestingCurrentTheme && site ) {
			this.props.fetchCurrentTheme( site.ID );
		}
	}

	render() {
		return null;
	}
}

QueryCurrentTheme.propTypes = {
	site: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
	requestingCurrentTheme: PropTypes.bool,
	fetchCurrentTheme: PropTypes.func,
};

export default connect(
	( state, props ) => (
		{ requestingCurrentTheme: isRequestingCurrentTheme( state, props.site && props.site.ID ) }
	),
	{ fetchCurrentTheme }
)( QueryCurrentTheme );
