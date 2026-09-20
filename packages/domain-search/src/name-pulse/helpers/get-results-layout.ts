import { detectFqdn, type FqdnIssue } from './detect-fqdn';
import { getWordCount, sanitizeDomainInput, sanitizeKeywordInput } from './sanitize';

export type NamePulseMode = 'empty' | 'fqdn' | 'single' | 'keyword' | 'ai';

export interface NamePulseResultsLayout {
	mode: NamePulseMode;
	baseName: string;
	wordCount: number;
	fqdn?: { baseName: string; tld: string; fullDomain: string };
	issue?: FqdnIssue;
	exactGrid: { show: boolean };
	suggestions: { show: boolean };
}

type NamePulseSections = Pick< NamePulseResultsLayout, 'exactGrid' | 'suggestions' >;

const AI_MODE_MIN_WORDS = 4;

// The fqdn and ai rows are placeholders that keep the exact-match behaviour
// until those modes are built.
const SECTIONS_BY_MODE: Record< NamePulseMode, NamePulseSections > = {
	empty: { exactGrid: { show: false }, suggestions: { show: false } },
	fqdn: { exactGrid: { show: true }, suggestions: { show: false } },
	single: { exactGrid: { show: true }, suggestions: { show: false } },
	keyword: { exactGrid: { show: true }, suggestions: { show: true } },
	ai: { exactGrid: { show: true }, suggestions: { show: true } },
};

function getMode( baseName: string, wordCount: number, isFqdn: boolean ): NamePulseMode {
	// A label needs at least two characters to be registrable.
	if ( baseName.length < 2 ) {
		return 'empty';
	}

	if ( isFqdn ) {
		return 'fqdn';
	}

	if ( wordCount >= AI_MODE_MIN_WORDS ) {
		return 'ai';
	}

	return wordCount === 1 ? 'single' : 'keyword';
}

/**
 * Pure function of the query: which mode it is in and which sections render.
 * Whitespace splits words; a single token may be an FQDN (`coffee.com`).
 */
export function getResultsLayout( query: string, tlds: readonly string[] ): NamePulseResultsLayout {
	const trimmed = query.trim();
	const isMultiWord = /\s/.test( trimmed );
	const detection = isMultiWord ? null : detectFqdn( trimmed, tlds );
	const fqdn = detection?.isFqdn
		? { baseName: detection.baseName, tld: detection.tld, fullDomain: detection.fullDomain }
		: undefined;
	const baseName = detection
		? detection.baseName
		: sanitizeDomainInput( sanitizeKeywordInput( trimmed ) );
	const wordCount = isMultiWord ? getWordCount( trimmed ) : Number( baseName.length > 0 );
	const mode = getMode( baseName, wordCount, Boolean( fqdn ) );

	return {
		mode,
		baseName,
		wordCount,
		...( fqdn ? { fqdn } : {} ),
		...( detection?.issue ? { issue: detection.issue } : {} ),
		...SECTIONS_BY_MODE[ mode ],
	};
}
