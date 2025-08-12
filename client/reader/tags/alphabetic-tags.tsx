import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { debounce } from 'lodash';
import { createRef } from 'react';
import StickyPanel from 'calypso/components/sticky-panel';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
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

const trackTagClick = ( slug: string ) => {
	recordTracksEvent( 'calypso_tags_page_tag_clicked', {
		type: 'alphabetic',
		tag: slug,
	} );
};

const TagsColumn = ( props: TagsColProps ) => {
	const path = addLocaleToPathLocaleInFront( `/tag/${ encodeURIComponent( props.slug ) }` );
	return (
		<div key={ props.slug }>
			<a href={ path } onClick={ trackTagClick.bind( null, props.slug ) }>
				<span className="alphabetic-tags__title">{ props.title }</span>
			</a>
		</div>
	);
};

const TagsRow = ( props: TagsRowProps ) => (
	<div className="alphabetic-tags__row">
		{ props.tags.map( ( tag: Tag | undefined, index ) =>
			tag ? (
				<div className="alphabetic-tags__col" key={ 'alphabetic-tags-col-' + index }>
					<TagsColumn slug={ tag.slug } title={ tag.title } />
				</div>
			) : null
		) }
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
			block: 'center',
			scrollMode: 'always',
		} );
		// set focus after scrollIntoViewport has completed.
		const focusElement = debounce( () => {
			element.focus();
			window.removeEventListener( 'scroll', focusElement );
		}, 50 );
		window.addEventListener( 'scroll', focusElement );
	}
};

export default function AlphabeticTags( { alphabeticTags }: AlphabeticTagsProps ) {
	const translate = useTranslate();
	const tagsTableRef = createRef< HTMLDivElement >();

	if ( ! alphabeticTags ) {
		return null;
	}

	// put the data into a format that can easily be rendered as a four column table.
	const tagTables: { [ key: string ]: Tag[][] } = {};

	for ( const letter in alphabeticTags ) {
		const sortedTags = alphabeticTags[ letter ].sort( ( a, b ) => {
			return a.title.localeCompare( b.title );
		} );
		tagTables[ letter ] = formatTable( sortedTags );
	}

	return (
		<>
			<div className="sticky-container">
				<StickyPanel minLimit={ 0 }>
					<div className="alphabetic-tags__header">
						<h2>{ translate( 'Tags from A — Z' ) }</h2>
						<div className="alphabetic-tags__tag-links">
							{ Object.keys( tagTables ).map( ( letter: string ) => (
								<Button
									variant="link"
									key={ 'alphabetic-tags-link-' + letter }
									onClick={ () => scrollToLetter( letter ) }
								>
									{ letter }
								</Button>
							) ) }
						</div>
					</div>
				</StickyPanel>
			</div>
			<div ref={ tagsTableRef }>
				{ Object.keys( tagTables ).map( ( letter: string ) => (
					<div className="alphabetic-tags__table" key={ 'alphabetic-tags-table-' + letter }>
						{ /* eslint-disable jsx-a11y/no-noninteractive-tabindex */ }
						<h3
							tabIndex={ 0 }
							className="alphabetic-tags__letter-title"
							id={ 'alphabetic-tags-table-' + letter }
						>
							{ letter }
						</h3>
						<TagsTable tags={ tagTables[ letter ] } />
					</div>
				) ) }
			</div>
		</>
	);
}
