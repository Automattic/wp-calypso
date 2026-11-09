import PropTypes from 'prop-types';
import { forwardRef, useState } from 'react';
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
	function ConnectUserMentionsFetcher( { siteId, forwardedRef, onFocus, ...rest } ) {
		const suggestions = useSelector( ( state ) => getUserSuggestions( state, siteId ) );
		// Mentions start with typing, so the suggestions wait for the first focus.
		const [ hasFocused, setHasFocused ] = useState( false );
		return (
			<>
				{ hasFocused && <QueryUsersSuggestions siteId={ siteId } /> }
				<WrappedComponent
					suggestions={ suggestions }
					ref={ forwardedRef }
					onFocus={ ( event ) => {
						setHasFocused( true );
						onFocus?.( event );
					} }
					{ ...rest }
				/>
			</>
		);
	}

	ConnectUserMentionsFetcher.propTypes = {
		siteId: PropTypes.number,
		onFocus: PropTypes.func,
	};

	return forwardRef( function ConnectUserMentions( props, ref ) {
		return <ConnectUserMentionsFetcher { ...props } forwardedRef={ ref } />;
	} );
};

export default connectUserMentions;
