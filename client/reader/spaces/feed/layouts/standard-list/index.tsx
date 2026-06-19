import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { SpaceFeedTimeSince } from '../../components/time-since';
import { getPostFields, type SpaceFeedDayGroup, type SpaceFeedPostFields } from '../../post-fields';
import type { SpaceFeedLayoutProps } from '../types';

import './style.scss';

type Row =
	| { kind: 'header'; key: string; label: string }
	| { kind: 'post'; key: string; fields: SpaceFeedPostFields };

const HEADER_SIZE = 44;
const ROW_SIZE = 88;

function BookmarkGlyph() {
	return (
		<svg
			className="space-feed-standard-list__bookmark"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.5L6 20V5a1 1 0 0 1 1-1Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function PostRow( { fields }: { fields: SpaceFeedPostFields } ) {
	return (
		<a className="space-feed-standard-list__row" href={ fields.postHref }>
			<span
				className="space-feed-standard-list__unread"
				data-unread={ fields.isUnread }
				aria-hidden="true"
			/>
			<div className="space-feed-standard-list__body">
				<h3 className="space-feed-standard-list__title">{ fields.title }</h3>
				{ fields.excerptHtml && (
					<div
						className="space-feed-standard-list__excerpt"
						// Sanitized by the Reader's formatExcerpt (allows only p/br/sup/sub).
						dangerouslySetInnerHTML={ { __html: fields.excerptHtml } } // eslint-disable-line react/no-danger
					/>
				) }
				<div className="space-feed-standard-list__source-row">
					<SiteIcon iconUrl={ fields.siteIconUrl } size={ 20 } />
					<span className="space-feed-standard-list__source">{ fields.sourceName }</span>
					{ fields.authorName && (
						<span className="space-feed-standard-list__tag">{ fields.authorName }</span>
					) }
					{ fields.siteDomain && (
						<span className="space-feed-standard-list__tag">{ fields.siteDomain }</span>
					) }
				</div>
			</div>
			<div className="space-feed-standard-list__aside">
				{ fields.publishedDate && (
					<span className="space-feed-standard-list__time">
						<SpaceFeedTimeSince date={ fields.publishedDate } />
					</span>
				) }
				<BookmarkGlyph />
			</div>
		</a>
	);
}

export function StandardListLayout( {
	posts,
	scrollElement,
	hasMore,
	isLoadingMore,
	loadMore,
	restoreKey,
}: SpaceFeedLayoutProps ) {
	const translate = useTranslate();

	const rows = useMemo< Row[] >( () => {
		const labelFor = ( group: Exclude< SpaceFeedDayGroup, '' > ): string => {
			switch ( group ) {
				case 'today':
					return translate( 'Today' );
				case 'yesterday':
					return translate( 'Yesterday' );
				case 'earlier':
					return translate( 'Earlier this week' );
				case 'older':
					return translate( 'Older' );
			}
		};

		const out: Row[] = [];
		let lastGroup: SpaceFeedDayGroup = '';
		posts.forEach( ( post, index ) => {
			const fields = getPostFields( post );
			const { dayGroup, key } = fields;
			if ( dayGroup && dayGroup !== lastGroup ) {
				out.push( {
					kind: 'header',
					key: `header-${ dayGroup }-${ index }`,
					label: labelFor( dayGroup ),
				} );
				lastGroup = dayGroup;
			}
			out.push( { kind: 'post', key: `post-${ key }`, fields } );
		} );
		return out;
	}, [ posts, translate ] );

	const { getListProps, items, measureElement, scrollMargin } = useInfiniteList( {
		scrollElement,
		count: rows.length,
		estimateSize: ( index ) => ( rows[ index ].kind === 'header' ? HEADER_SIZE : ROW_SIZE ),
		getItemKey: ( index ) => rows[ index ].key,
		hasMore,
		isLoadingMore,
		loadMore,
		restoreKey,
	} );

	return (
		<div { ...getListProps( { className: 'space-feed-standard-list' } ) }>
			{ items.map( ( virtualRow ) => {
				const row = rows[ virtualRow.index ];
				return (
					<div
						key={ virtualRow.key }
						data-index={ virtualRow.index }
						ref={ measureElement }
						className="space-feed-standard-list__item"
						style={ { transform: `translateY(${ virtualRow.start - scrollMargin }px)` } }
					>
						{ row.kind === 'header' ? (
							<h2 className="space-feed-standard-list__group">{ row.label }</h2>
						) : (
							<PostRow fields={ row.fields } />
						) }
					</div>
				);
			} ) }
		</div>
	);
}
