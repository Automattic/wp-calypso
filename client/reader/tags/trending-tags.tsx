import titlecase from 'to-title-case';
import formatNumberCompact from 'calypso/lib/format-number-compact';
import { TagResult } from './controller';

interface TrendingTagsProps {
	trendingTags: TagResult[];
}

interface TagRowProps {
	slug: string;
	title: string;
	count: number;
}

const TagRow = ( props: TagRowProps ) => (
	<div className="trending-tags__column" key={ props.slug }>
		<a href={ `/tag/${ encodeURIComponent( props.slug ) }` }>
			<span className="trending-tags__title">{ titlecase( props.title ) }</span>
			<span className="trending-tags__count">{ formatNumberCompact( props.count ) }</span>
		</a>
	</div>
);

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
		<div>
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
