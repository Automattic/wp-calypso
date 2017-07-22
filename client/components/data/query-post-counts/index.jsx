/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import { requestPostCounts } from 'state/posts/counts/actions';
import { isRequestingPostCounts } from 'state/posts/counts/selectors';
import PeriodicActionHandler from 'components/periodic-action-handler';

class QueryPostCounts extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				this.props.type === nextProps.type ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.polling || props.requesting ) {
			return;
		}

		props.requestPostCounts( props.siteId, props.type );
	}

	render() {
		if ( this.props.polling ) {
			return (
				<PeriodicActionHandler
					periodicActionId={ `PollPostCounts-${ this.props.siteId }-${ this.props.type }` }
					interval={ 1000 }
					actionToExecute={ requestPostCounts( this.props.siteId, this.props.type ) }
					skipChecker={ partialRight( isRequestingPostCounts, this.props.siteId, this.props.type ) }
					executeOnStart={ true } />
			);
		}
		return null;
	}
}

QueryPostCounts.propTypes = {
	siteId: PropTypes.number.isRequired,
	type: PropTypes.string.isRequired,
	requesting: PropTypes.bool,
	requestPostCounts: PropTypes.func,
	polling: PropTypes.bool,
};

export default connect(
	( state, ownProps ) => {
		const { siteId, type } = ownProps;
		return {
			requesting: isRequestingPostCounts( state, siteId, type )
		};
	},
	{ requestPostCounts }
)( QueryPostCounts );
