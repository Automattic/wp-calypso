import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import { Flex, FlexItem } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import ArticleContent from 'calypso/blocks/support-article-dialog/dialog-content';
import { RESULT_ARTICLE } from './constants';

interface Result {
	post_id: number;
	link: string;
	type: string;
}

interface Props {
	result: Result;
	handleBackButton: () => void;
	searchQuery: string;
}

const InlineHelpEmbedResult: React.FC< Props > = ( { result, handleBackButton, searchQuery } ) => {
	const { post_id: postId, link, type = RESULT_ARTICLE } = result;
	const { __ } = useI18n();

	useEffect( () => {
		const tracksData = {
			search_query: searchQuery,
			location: 'inline-help-popover',
			result_url: result.link,
		};

		recordTracksEvent( `calypso_inlinehelp_${ type }_open`, tracksData );
	}, [] );

	return (
		<div className="inline-help__embed-result">
			<Flex justify="space-between">
				<FlexItem>
					<Button borderless={ true } onClick={ handleBackButton }>
						<Gridicon icon={ 'chevron-left' } size={ 18 } />
						{ __( 'Back' ) }
					</Button>
				</FlexItem>
				<FlexItem>
					<Button borderless={ true } href={ link } target="_blank">
						<Gridicon icon={ 'external' } size={ 18 } />
					</Button>
				</FlexItem>
			</Flex>
			<ArticleContent postId={ postId } blogId={ null } articleUrl={ null } />
		</div>
	);
};

export default InlineHelpEmbedResult;
