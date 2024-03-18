import { addLocaleToPathLocaleInFront, formatNumber } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import titlecase from 'to-title-case';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { TagResult } from './controller';

interface TrendingTagsProps {
	trendingTags: TagResult[];
}

interface TagRowProps {
	slug: string;
	title: string;
	count: number;
}

const trackTagClick = ( slug: string ) => {
	recordTracksEvent( 'calypso_tags_page_tag_clicked', {
		type: 'trending',
		tag: slug,
	} );
};

const TagRow = ( props: TagRowProps ) => {
	const translate = useTranslate();
	const path = addLocaleToPathLocaleInFront( `/tag/${ encodeURIComponent( props.slug ) }` );
	return (
		<div className="trending-tags__column" key={ props.slug }>
			<a href={ path } onClick={ trackTagClick.bind( null, props.slug ) }>
				<span className="trending-tags__title">{ titlecase( props.title ) }</span>
				<span className="trending-tags__count">
					{ formatNumber( props.count, translate.localeSlug ) }
				</span>
			</a>
		</div>
	);
};

export default function TrendingTags( { trendingTags }: TrendingTagsProps ) {
	if ( ! trendingTags ) {
		return null;
	}

	// put the data into a format that can easily be rendered as a two column table.
	const tagRows: TagResult[][] = [];
	for ( let i = 0; i < trendingTags.length; i += 2 ) {
		const tagOne = trendingTags[ i ];
		const tagTwo = trendingTags[ i + 1 ];
		tagRows.push( [ tagOne, tagTwo ] );
	}

	return (
		<div className="trending-tags__container">
			{ tagRows.map( ( tagRow: TagResult[], index ) => (
				<div className="trending-tags__row" key={ 'tags-row-' + index }>
					<TagRow
						slug={ tagRow[ 0 ].tag.slug }
						title={ tagRow[ 0 ].tag.title }
						count={ tagRow[ 0 ].count }
					/>
					{ tagRow[ 1 ] && (
						<TagRow
							slug={ tagRow[ 1 ].tag.slug }
							title={ tagRow[ 1 ].tag.title }
							count={ tagRow[ 1 ].count }
						/>
					) }
				</div>
			) ) }
		</div>
	);
}
