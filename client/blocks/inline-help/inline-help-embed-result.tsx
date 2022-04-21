import { Button, Gridicon } from '@automattic/components';
import { Flex } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import ArticleContent from 'calypso/blocks/support-article-dialog/dialog-content';

interface Result {
	post_id: number;
	link: string;
}

interface Props {
	result: Result;
	handleBackButton: any;
}

const InlineHelpEmbedResult: React.FC< Props > = ( { result, handleBackButton } ) => {
	const { post_id: postId, link } = result;
	const { __ } = useI18n();

	return (
		<div className="inline-help__embed-result">
			<Flex justify="space-between">
				<Button borderless={ true } onClick={ handleBackButton }>
					<Gridicon icon={ 'chevron-left' } size={ 18 } />
					{ __( 'Back' ) }
				</Button>
				<Button borderless={ true } href={ link } target="_blank">
					<Gridicon icon={ 'external' } size={ 18 } />
				</Button>
			</Flex>
			<ArticleContent postId={ postId } blogId={ null } articleUrl={ null } />
		</div>
	);
};

export default InlineHelpEmbedResult;
