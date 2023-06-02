import PropTypes from 'prop-types';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryUsersSuggestions from 'calypso/components/data/query-users-suggestions';
import { getUserSuggestions } from 'calypso/state/user-suggestions/selectors';

/**
 * connectUserMentions is a higher-order component that connects the child component to user suggestions from the API.
 *
 * example: connectUserMentions( Component )
 *
 * @param {Object} WrappedComponent - React component to wrap
 * @returns {Object} the enhanced component
 */
const connectUserMentions = ( WrappedComponent ) => {
	class connectUserMentionsFetcher extends PureComponent {
		static propTypes = {
			siteId: PropTypes.number,
		};

		render() {
			return (
				<Fragment>
					<QueryUsersSuggestions siteId={ this.props.siteId } />
					<WrappedComponent { ...this.props } />
				</Fragment>
			);
		}
	}

	return connect( ( state, ownProps ) => {
		return {
			siteId: ownProps.siteId,
			suggestions: getUserSuggestions( state, ownProps.siteId ),
		};
	} )( connectUserMentionsFetcher );
};

export default connectUserMentions;
