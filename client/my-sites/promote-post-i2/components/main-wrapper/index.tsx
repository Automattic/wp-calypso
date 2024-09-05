import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import Main from 'calypso/components/main';
import usePromoteParams from 'calypso/data/promote-post/use-promote-params';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

interface Props {
	children: ReactNode;
}

export default function MainWrapper( { children }: Props ) {
	const { isModalOpen, selectedSiteId, selectedPostId, keyValue } = usePromoteParams();

	const currentQuery = useSelector( getCurrentQueryArguments );
	const sourceQuery = currentQuery?.[ 'source' ];
	const source = sourceQuery ? sourceQuery.toString() : undefined;

	const type = keyValue?.split( '-' )[ 0 ];

	let postId = '';
	let campaignId = '';

	if ( type === 'post' ) {
		postId = selectedPostId;
	} else if ( type === 'campaign' ) {
		campaignId = keyValue?.split( '-' )[ 1 ];
	}

	return (
		<Main wideLayout className="promote-post-i2">
			{ children }

			{ selectedSiteId && selectedPostId && keyValue && (
				<BlazePressWidget
					isVisible={ isModalOpen }
					siteId={ selectedSiteId }
					postId={ postId }
					campaignId={ campaignId }
					keyValue={ keyValue }
					source={ source }
				/>
			) }
		</Main>
	);
}
