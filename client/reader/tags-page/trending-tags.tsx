import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface TagData {
	tags: TagResult[];
}
interface TagResult {
	count: number;
	tag: Tag;
}
interface Tag {
	slug: string;
	title: string;
}

export default function TrendingTags() {
	const query = {
		staleTime: 86400000, // 1 day
		select: ( data: TagData ) => {
			const tagRows: TagResult[][] = [];
			if ( ! data || ! data.tags ) {
				return tagRows;
			}
			// put the data into a format that can easily be rendered as a two column table.
			for ( let i = 0; i < data.tags.length; i += 2 ) {
				const tagOne = data.tags[ i ];
				const tagTwo = data.tags[ i + 1 ];
				tagRows.push( [ tagOne, tagTwo ] );
			}
			return tagRows;
		},
	};

	const tagsResponse = useQuery(
		[ 'trending-tags' ],
		() => wpcom.req.get( `/read/trending/tags`, { apiVersion: '1.2' } ),
		query
	);

	const toTitleCase = ( text: string ) => {
		return text.toLowerCase().replace( /(^|\s)\S/g, function ( firstLetter: string ) {
			return firstLetter.toUpperCase();
		} );
	};

	const abbreviateNumber = ( number: number ) => {
		if ( number >= 1000000 ) {
			return ( number / 1000000 ).toFixed( 0 ) + 'm';
		} else if ( number >= 1000 ) {
			return ( number / 1000 ).toFixed( 0 ) + 'k';
		}
		return number.toString();
	};

	const renderTagRow = ( tag: TagResult ) => (
		<div className="trending-tags__column" key={ tag.tag.slug }>
			<a href={ `/tag/${ encodeURIComponent( tag.tag.slug ) }` }>
				<span className="trending-tags__title">{ toTitleCase( tag.tag.title ) }</span>
				<span className="trending-tags__count">{ abbreviateNumber( tag.count ) }</span>
			</a>
		</div>
	);

	return (
		<div>
			{ tagsResponse.status === 'success' &&
				tagsResponse.data?.map( ( tagRow: TagResult[], index ) => (
					<div className="trending-tags__row" key={ 'tags-row-' + index }>
						{ renderTagRow( tagRow[ 0 ] ) }
						{ tagRow[ 1 ] && renderTagRow( tagRow[ 1 ] ) }
					</div>
				) ) }
		</div>
	);
}
