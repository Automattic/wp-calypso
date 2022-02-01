import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { SUPPORT_BLOG_ID } from 'calypso/blocks/inline-help/constants';
import { isPostKeyLike } from 'calypso/reader/post-key';
import { fetchAlternates } from 'calypso/state/support-articles-alternates/actions';
import { shouldRequestSupportArticleAlternates } from 'calypso/state/support-articles-alternates/selectors';

const request = ( postKey ) => ( dispatch, getState ) => {
	if ( shouldRequestSupportArticleAlternates( getState(), postKey ) ) {
		dispatch( fetchAlternates( postKey ) );
	}
};

function QuerySupportArticleAlternates( { blogId, postId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		const postKey = {
			blogId: blogId || SUPPORT_BLOG_ID,
			postId,
		};

		if ( isPostKeyLike( postKey ) ) {
			dispatch( request( postKey ) );
		}
	}, [ dispatch, blogId, postId ] );

	return null;
}

QuerySupportArticleAlternates.propTypes = {
	blogId: PropTypes.number,
	postId: PropTypes.number.isRequired,
};

export default QuerySupportArticleAlternates;
