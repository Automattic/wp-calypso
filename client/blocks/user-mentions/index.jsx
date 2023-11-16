import { forwardRef } from 'react';
import addUserMentions from './add';
import connectUserMentions from './connect';

/**
 * withUserMentions is a higher-order component that adds connected user mention support to whatever input it wraps.
 * @example withUserMentions( Component )
 * @param {Object} WrappedComponent - React component to wrap
 * @returns {Object} the enhanced component
 */
const withUserMentions = ( WrappedComponent ) => {
	function TextInputWrapper( { siteId, forwardedRef, ...rest } ) {
		return <WrappedComponent { ...rest } ref={ forwardedRef } />;
	}

	return connectUserMentions(
		addUserMentions(
			forwardRef( ( props, ref ) => {
				return <TextInputWrapper { ...props } forwardedRef={ ref } />;
			} )
		)
	);
};

export default withUserMentions;
