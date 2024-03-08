import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { useSelector } from 'react-redux';
import QueryUsersSuggestions from 'calypso/components/data/query-users-suggestions';
import { getUserSuggestions } from 'calypso/state/user-suggestions/selectors';

/**
 * connectUserMentions is a higher-order component that connects the child component to user suggestions from the API.
 *
 * example: connectUserMentions( Component )
 * @param {Object} WrappedComponent - React component to wrap
 * @returns {Object} the enhanced component
 */
const connectUserMentions = ( WrappedComponent ) => {
	function ConnectUserMentionsFetcher( { siteId, forwardedRef, ...rest } ) {
		const suggestions = useSelector( ( state ) => getUserSuggestions( state, siteId ) );
		return (
			<>
				<QueryUsersSuggestions siteId={ siteId } />
				<WrappedComponent suggestions={ suggestions } ref={ forwardedRef } { ...rest } />
			</>
		);
	}

	ConnectUserMentionsFetcher.propTypes = {
		siteId: PropTypes.number,
	};

	return forwardRef( ( props, ref ) => (
		<ConnectUserMentionsFetcher { ...props } forwardedRef={ ref } />
	) );
};

export default connectUserMentions;
