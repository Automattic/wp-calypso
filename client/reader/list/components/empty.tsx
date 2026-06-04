import { readListItemsAllQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { ReaderList } from 'calypso/reader/list-manage/types';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import type { JSX } from 'react';

interface ListEmptyProps {
	list?: ReaderList;
}

export default function ListEmpty( { list }: ListEmptyProps ): JSX.Element {
	const translate = useTranslate();
	const previousRoute: string = useSelector( getPreviousRoute );
	const { data: itemsData, isFetched } = useQuery( {
		...readListItemsAllQuery( list?.owner ?? null, list?.slug ?? null ),
		enabled: !! list,
	} );
	// Only flip to "empty" once we've actually fetched — otherwise the initial
	// undefined cache makes every list look empty during the loading flash.
	const isEmptyList = isFetched && ! itemsData?.items?.length;
	const shouldPromptManagement = isEmptyList && list?.is_owner;
	const isRecommendedBlogsList = list?.slug === 'recommended-blogs';

	function previousRouteIsUserProfileLists(): boolean {
		return /^\/reader\/users\/[a-z0-9]+\/lists\??$/.test( previousRoute );
	}

	function getActionBtnLink(): string {
		if ( shouldPromptManagement ) {
			return `/reader/list/${ list?.owner }/${ list?.slug }/edit/items`;
		}

		return previousRouteIsUserProfileLists() ? previousRoute : '/reader';
	}

	function getActionBtnText(): string {
		if ( shouldPromptManagement ) {
			return isRecommendedBlogsList ? translate( 'Add recommendations' ) : translate( 'Add items' );
		}

		return previousRouteIsUserProfileLists()
			? translate( 'Back to User Profile' )
			: translate( 'Back to Following' );
	}

	function getTitle(): string {
		if ( shouldPromptManagement ) {
			return isRecommendedBlogsList
				? translate( 'No recommendations' )
				: translate( 'This list is empty' );
		}

		return translate( 'No recent posts' );
	}

	function getLine(): string {
		if ( shouldPromptManagement ) {
			return isRecommendedBlogsList
				? translate( 'You have not recommended any blogs yet.' )
				: translate( 'You have not added any items to this list.' );
		}

		return translate( 'The sites in this list have not posted anything recently.' );
	}

	const action = (
		<a className="empty-content__action button is-primary" href={ getActionBtnLink() }>
			{ getActionBtnText() }
		</a>
	);

	return <EmptyContent title={ getTitle() } line={ getLine() } action={ action } />;
}
