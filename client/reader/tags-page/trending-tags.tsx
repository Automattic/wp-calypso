import { TagResult } from './controller';

interface Props {
	trendingTags: TagResult[];
}

export default function TrendingTags( { trendingTags }: Props ) {
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
			{ tagRows.map( ( tagRow: TagResult[], index ) => (
				<div className="trending-tags__row" key={ 'tags-row-' + index }>
					{ renderTagRow( tagRow[ 0 ] ) }
					{ tagRow[ 1 ] && renderTagRow( tagRow[ 1 ] ) }
				</div>
			) ) }
		</div>
	);
}
