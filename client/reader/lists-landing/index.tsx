import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { CreateListInvitation } from 'calypso/reader/components/create-list-invitation';
import { ListCard } from 'calypso/reader/components/list-card';
import ReaderMain from 'calypso/reader/components/reader-main';
import { usePublicListQuery } from 'calypso/reader/list-stream/use-public-list-query';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { usePopularListsQuery } from './use-popular-lists-query';
import type { PopularListSummary } from './use-popular-lists-query';

import './style.scss';

const MAX_DISPLAYED_LISTS = 5;

function ListCardWithDetails( { list }: { list: PopularListSummary } ) {
	const dispatch = useDispatch();
	const { data: listDetail, isLoading } = usePublicListQuery( list.owner, list.slug );

	function handleOpenList() {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_lists_landing_list_clicked', {
				list_owner: list.owner,
				list_slug: list.slug,
			} )
		);
	}

	return (
		<ListCard
			title={ list.title }
			description={ list.description }
			owner={ list.owner }
			itemCount={ list.item_count }
			tags={ list.tags }
			items={
				listDetail?.items?.map( ( item ) => ( {
					site_name: item.site_name,
					site_icon: item.site_icon ?? null,
				} ) ) ?? []
			}
			listUrl={ `/reader/list/${ list.owner }/${ list.slug }` }
			isLoadingItems={ isLoading }
			onOpenList={ handleOpenList }
		/>
	);
}

function ListsLandingSkeleton() {
	return (
		<div className="lists-landing__skeleton">
			{ Array.from( { length: 3 } ).map( ( _, i ) => (
				<div key={ i } className="lists-landing__skeleton-card">
					<div className="lists-landing__skeleton-title" />
					<div className="lists-landing__skeleton-description" />
					<div className="lists-landing__skeleton-tags" />
				</div>
			) ) }
		</div>
	);
}

function ListsLanding() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data, isLoading } = usePopularListsQuery();

	const lists = data?.lists?.slice( 0, MAX_DISPLAYED_LISTS ) ?? [];
	const isEmpty = ! isLoading && lists.length === 0;

	function handleCreateListClick() {
		dispatch( recordReaderTracksEvent( 'calypso_reader_lists_landing_create_clicked' ) );
	}

	return (
		<ReaderMain>
			<DocumentHead
				title={ translate( '%s \u2039 Reader', {
					args: translate( 'Discover Lists' ),
					comment: '%s is the section name. For example: "My Likes"',
				} ) }
			/>

			<div className="lists-landing">
				<header className="lists-landing__header">
					<h1 className="lists-landing__title">{ translate( 'Discover Lists' ) }</h1>
					<p className="lists-landing__subtitle">
						{ translate(
							'Explore curated groups of interesting creators in the WordPress.com community.'
						) }
					</p>
				</header>

				{ isLoading && <ListsLandingSkeleton /> }

				{ isEmpty && (
					<p className="lists-landing__empty">{ translate( 'No lists to show right now.' ) }</p>
				) }

				{ lists.map( ( list ) => (
					<ListCardWithDetails key={ list.ID } list={ list } />
				) ) }

				{ ! isLoading && <CreateListInvitation onCreateClick={ handleCreateListClick } /> }
			</div>
		</ReaderMain>
	);
}

export default ListsLanding;
