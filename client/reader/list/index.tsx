import { readListQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import ReaderListHeader from 'calypso/reader/list/components/list-header';
import ListMissing from 'calypso/reader/list/components/missing';
import ListPosts from 'calypso/reader/list/views/posts';
import ListSites from 'calypso/reader/list/views/sites';
import { receiveReaderList } from 'calypso/state/reader/lists/actions';
import { getListByOwnerAndSlug } from 'calypso/state/reader/lists/selectors';
import type { ReaderList } from 'calypso/reader/list-manage/types';
import type { AppState } from 'calypso/types';

interface ReaderListProps {
	owner: string;
	slug: string;
	view: 'posts' | 'sites';
	streamKey: string;
	trackScrollPage?: () => void;
	onUpdatesShown?: () => void;
}

export default function ReaderList( props: ReaderListProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { owner, slug, view } = props;
	const list = useSelector( ( state: AppState ) =>
		getListByOwnerAndSlug( state, owner, slug )
	) as ReaderList;
	const { data, isFetched } = useQuery( readListQuery( owner, slug ) );

	useEffect( () => {
		if ( data?.list ) {
			dispatch( receiveReaderList( { list: data.list } ) );
		}
	}, [ data, dispatch ] );

	if ( ! isFetched ) {
		return null;
	}

	if ( isFetched && ! data?.list ) {
		return <ListMissing />;
	}

	const title = list?.title || translate( 'Loading list' );
	const renderSelectedTabContent = (): React.ReactNode => {
		switch ( view ) {
			case 'posts':
				return (
					<ListPosts
						list={ list }
						listName={ title }
						streamKey={ props.streamKey }
						trackScrollPage={ props.trackScrollPage }
						onUpdatesShown={ props.onUpdatesShown }
					/>
				);
			case 'sites':
				return <ListSites list={ list } />;
			default:
				page.redirect( '/reader' );
				return null;
		}
	};

	return (
		<ReaderMain>
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: title,
					comment: '%s is the section name. For example: "My Likes"',
				} ) }
			/>
			<ReaderListHeader list={ list } view={ view } />
			{ renderSelectedTabContent() }
		</ReaderMain>
	);
}
