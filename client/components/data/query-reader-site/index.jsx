import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestSite } from 'calypso/state/reader/sites/actions';
import { shouldSiteBeFetched } from 'calypso/state/reader/sites/selectors';

class QueryReaderSite extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		if ( this.props.shouldSiteBeFetched ) {
			this.props.requestSite( this.props.siteId );
		}
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.shouldSiteBeFetched || this.props.siteId === nextProps.siteId ) {
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
	requestSite: PropTypes.func,
};

QueryReaderSite.defaultProps = {
	requestSite: () => {},
};

export default connect(
	( state, ownProps ) => {
		const { siteId } = ownProps;
		return {
			shouldSiteBeFetched: shouldSiteBeFetched( state, siteId ),
		};
	},
	{
		requestSite,
	}
)( QueryReaderSite );
