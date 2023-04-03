import { PATTERN_ASSEMBLER_EVENTS } from './events';
import type { Pattern, Category } from './types';

type Arguments = {
	categories: Category[];
	footer: Pattern | null;
	generateKey: ( pattern: Pattern ) => string;
	header: Pattern | null;
	recordTracksEvent: ( eventName: string, eventProperties: Record< string, unknown > ) => void;
	sectionPosition: number | null;
	sections: Pattern[];
	setFooter: ( pattern: Pattern | null ) => void;
	setHeader: ( pattern: Pattern | null ) => void;
	setSections: ( sections: Pattern[] ) => void;
	showNotice: ( action: string, pattern: Pattern ) => void;
	updateActivePatternPosition: ( position: number ) => void;
};

export const useScreenHandler = ( {
	categories,
	footer,
	generateKey,
	header,
	recordTracksEvent,
	sectionPosition,
	sections,
	setFooter,
	setHeader,
	setSections,
	showNotice,
	updateActivePatternPosition,
}: Arguments ) => {
	const trackEventPatternSelect = ( {
		patternType,
		patternId,
		patternName,
		patternCategory,
	}: {
		patternType: string;
		patternId: number;
		patternName: string;
		patternCategory: string | undefined;
	} ) => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_SELECT_CLICK, {
			pattern_type: patternType,
			pattern_id: patternId,
			pattern_name: patternName,
			pattern_category: patternCategory,
		} );
	};

	const updateHeader = ( pattern: Pattern | null ) => {
		setHeader( pattern );
		updateActivePatternPosition( -1 );
		if ( pattern ) {
			if ( header ) {
				showNotice( 'replace', pattern );
			} else {
				showNotice( 'add', pattern );
			}
		} else if ( header ) {
			showNotice( 'remove', header );
		}
	};

	const updateFooter = ( pattern: Pattern | null ) => {
		setFooter( pattern );
		updateActivePatternPosition( sections.length );
		if ( pattern ) {
			if ( footer ) {
				showNotice( 'replace', pattern );
			} else {
				showNotice( 'add', pattern );
			}
		} else if ( footer ) {
			showNotice( 'remove', footer );
		}
	};

	const replaceSection = ( pattern: Pattern ) => {
		if ( sectionPosition !== null ) {
			setSections( [
				...sections.slice( 0, sectionPosition ),
				{
					...pattern,
					key: sections[ sectionPosition ].key,
				},
				...sections.slice( sectionPosition + 1 ),
			] );
			updateActivePatternPosition( sectionPosition );
			showNotice( 'replace', pattern );
		}
	};

	const addSection = ( pattern: Pattern ) => {
		setSections( [
			...( sections as Pattern[] ),
			{
				...pattern,
				key: generateKey( pattern ),
			},
		] );
		updateActivePatternPosition( sections.length );
		showNotice( 'add', pattern );
	};

	const onSelect = (
		type: string,
		selectedPattern: Pattern | null,
		selectedCategory?: string | null
	) => {
		if ( selectedPattern ) {
			// Inject the selected pattern category or the first category
			// because it's used in tracks and as pattern name in the list
			selectedPattern.category = categories.find(
				( { name } ) => name === ( selectedCategory || selectedPattern.categories[ 0 ] )
			);

			trackEventPatternSelect( {
				patternType: type,
				patternId: selectedPattern.id,
				patternName: selectedPattern.name,
				patternCategory: selectedPattern.category?.name,
			} );

			if ( 'section' === type ) {
				if ( sectionPosition !== null ) {
					replaceSection( selectedPattern );
				} else {
					addSection( selectedPattern );
				}
			}
		}

		if ( 'header' === type ) {
			updateHeader( selectedPattern );
		}
		if ( 'footer' === type ) {
			updateFooter( selectedPattern );
		}
	};

	return {
		onSelect,
	};
};
