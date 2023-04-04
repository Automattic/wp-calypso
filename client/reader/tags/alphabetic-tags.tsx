import titlecase from 'to-title-case';
import { AlphabeticTagsResult, Tag } from './controller';

interface AlphabeticTagsProps {
	alphabeticTags: AlphabeticTagsResult;
}

interface TagsColProps {
	slug: string;
	title: string;
}
interface TagsRowProps {
	tags: ( Tag | undefined )[];
}

interface TagsTableProps {
	tags: Tag[][];
}

const TagsColumn = ( props: TagsColProps ) => (
	<div className="alphabetic-tags__column" key={ props.slug }>
		<a href={ `/tag/${ encodeURIComponent( props.slug ) }` }>
			<span className="alphabetic-tags__title">{ titlecase( props.title ) }</span>
		</a>
	</div>
);

const TagsRow = ( props: TagsRowProps ) => (
	<div className="alphabetic-tags__row">
		{ props.tags.map( ( tag: Tag | undefined, index ) => (
			<div key={ 'alphabetic-tags-col-' + index }>
				{ tag && <TagsColumn slug={ tag.slug } title={ tag.title } /> }
				{ ! tag && <TagsColumn slug="" title="" /> }
			</div>
		) ) }
	</div>
);

const TagsTable = ( props: TagsTableProps ) => (
	<div>
		{ props.tags.map( ( tagRow: Tag[], index ) => (
			<TagsRow key={ 'alphabetic-tags-row-' + index } tags={ tagRow } />
		) ) }
	</div>
);

const formatTable = ( tags: Tag[] ): Tag[][] => {
	const tagRows: Tag[][] = [];
	for ( let i = 0; i < tags.length; i += 4 ) {
		const tagOne = tags[ i ];
		const tagTwo = tags[ i + 1 ];
		const tagThree = tags[ i + 2 ];
		const tagFour = tags[ i + 3 ];
		tagRows.push( [ tagOne, tagTwo, tagThree, tagFour ] );
	}
	return tagRows;
};

export default function AlphabeticTags( { alphabeticTags }: AlphabeticTagsProps ) {
	if ( ! alphabeticTags ) {
		return null;
	}

	// put the data into a format that can easily be rendered as a four column table.
	const tagTables: { [ key: string ]: Tag[][] } = {};

	for ( const letter in alphabeticTags ) {
		tagTables[ letter ] = formatTable( alphabeticTags[ letter ] );
	}

	return (
		<>
			{ Object.keys( tagTables ).map( ( letter: string ) => (
				<div key={ 'alphabetic-tags-table-' + letter }>
					<h2>{ letter }</h2>
					<TagsTable tags={ tagTables[ letter ] } />
				</div>
			) ) }
		</>
	);
}
