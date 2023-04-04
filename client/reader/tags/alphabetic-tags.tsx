import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import titlecase from 'to-title-case';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
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
	<div key={ props.slug }>
		<a href={ `/tag/${ encodeURIComponent( props.slug ) }` }>
			<span className="alphabetic-tags__title">{ titlecase( props.title ) }</span>
		</a>
	</div>
);

const TagsRow = ( props: TagsRowProps ) => (
	<div className="alphabetic-tags__row">
		{ props.tags.map( ( tag: Tag | undefined, index ) => (
			<div className="alphabetic-tags__col" key={ 'alphabetic-tags-col-' + index }>
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

const scrollToLetter = ( letter: string ) => {
	const element = document.getElementById( 'alphabetic-tags-table-' + letter );
	if ( element ) {
		scrollIntoViewport( element, {
			behavior: 'smooth',
			scrollMode: 'if-needed',
		} );
	}
};

export default function AlphabeticTags( { alphabeticTags }: AlphabeticTagsProps ) {
	const translate = useTranslate();
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
			<div className="alphabetic-tags__header">
				<h2>{ translate( 'Tags from A — Z' ) }</h2>
				<div className="alphabetic-tags__tag-links">
					{ Object.keys( tagTables ).map( ( letter: string ) => (
						<Button
							isLink
							key={ 'alphabetic-tags-link-' + letter }
							onClick={ () => scrollToLetter( letter ) }
						>
							{ letter }
						</Button>
					) ) }
				</div>
			</div>
			{ Object.keys( tagTables ).map( ( letter: string ) => (
				<div className="alphabetic-tags__table" key={ 'alphabetic-tags-table-' + letter }>
					<h3 className="alphabetic-tags__letter-title" id={ 'alphabetic-tags-table-' + letter }>
						{ letter }
					</h3>
					<TagsTable tags={ tagTables[ letter ] } />
				</div>
			) ) }
		</>
	);
}
