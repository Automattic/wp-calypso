/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { shouldSiteBeFetched } from 'state/reader/sites/selectors';
import { requestSite } from 'state/reader/sites/actions';

class QueryReaderSite extends Component {
	componentWillMount() {
		if ( this.props.shouldSiteBeFetched ) {
			this.props.requestSite( this.props.siteId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.shouldSiteBeFetched || ( this.props.siteId === nextProps.siteId ) ) {
			return;
		}

		nextProps.requestSite( nextProps.siteId );
	}

	render() {
		return null;
	}
}

QueryReaderSite.propTypes = {
	siteId: PropTypes.number,
	shouldSiteBeFetched: PropTypes.bool,
	requestSite: PropTypes.func
};

QueryReaderSite.defaultProps = {
	requestSite: () => {}
};

export default connect(
	( state, ownProps ) => {
		const { siteId } = ownProps;
		return {
			shouldSiteBeFetched: shouldSiteBeFetched( state, siteId )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestSite
		}, dispatch );
	}
)( QueryReaderSite );
