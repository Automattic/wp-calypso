import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryReaderListItems from 'calypso/components/data/query-reader-list-items';
import EmptyContent from 'calypso/components/empty-content';
import { getListItems } from 'calypso/state/reader/lists/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';

interface ListEmptyContentProps {
	list?: {
		title: string;
		owner: string;
		slug: string;
		is_owner: boolean;
		ID: number;
	};
}

export default function ListEmptyContent( { list }: ListEmptyContentProps ): JSX.Element {
	const translate = useTranslate();
	const previousRoute: string = useSelector( getPreviousRoute );
	const listItems = useSelector( ( state ) =>
		list ? getListItems( state, list.ID ) : undefined
	);
	const isEmptyList = ! listItems?.length;
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

	return (
		<>
			<QueryReaderListItems owner={ list?.owner } slug={ list?.slug } />
			<EmptyContent title={ getTitle() } line={ getLine() } action={ action } />
		</>
	);
}
