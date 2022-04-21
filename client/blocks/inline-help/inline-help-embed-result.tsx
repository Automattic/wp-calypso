import React from 'react';
import ArticleContent from 'calypso/blocks/support-article-dialog/dialog-content';

interface Result {
	post_id: number;
}

const InlineHelpEmbedResult: React.FC< { result: Result } > = ( { result } ) => {
	const { post_id: postId } = result;

	return <ArticleContent postId={ postId } blogId={ null } articleUrl={ null } />;
};

export default InlineHelpEmbedResult;
