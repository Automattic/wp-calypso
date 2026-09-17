import { NAME_PULSE_AI_MODE_MIN_WORDS, NAME_PULSE_TLDS } from './constants';
import { detectFqdn } from './detect-fqdn';
import { getWordCount, sanitizeDomainInput, sanitizeKeywordInput } from './sanitize';

export type NamePulseMode = 'empty' | 'fqdn' | 'single' | 'keyword' | 'ai';

export interface NamePulseResultsLayout {
	mode: NamePulseMode;
	baseName: string;
	wordCount: number;
	fqdn?: { baseName: string; tld: string; fullDomain: string };
	showFilter: boolean;
	showBanner: boolean;
	showFqdnCard: boolean;
	topResults: { show: boolean; style: 'compact' | 'card'; instant: boolean };
	exactGrid: { show: boolean; instant: boolean };
	suggestions: {
		show: boolean;
		title: 'more' | 'related';
		source: 'lds' | 'keyword';
		instant: boolean;
	};
	creative: { show: boolean };
}

type NamePulseSections = Omit< NamePulseResultsLayout, 'mode' | 'baseName' | 'wordCount' | 'fqdn' >;

/**
 * The results table from the spec, one column per mode. `instant` sections
 * render from data the client already has; the others wait for a request.
 */
const SECTIONS_BY_MODE: Record< NamePulseMode, NamePulseSections > = {
	empty: {
		showFilter: false,
		showBanner: false,
		showFqdnCard: false,
		topResults: { show: false, style: 'card', instant: false },
		exactGrid: { show: false, instant: false },
		suggestions: { show: false, title: 'more', source: 'lds', instant: false },
		creative: { show: false },
	},
	fqdn: {
		showFilter: true,
		showBanner: true,
		showFqdnCard: true,
		topResults: { show: true, style: 'compact', instant: true },
		exactGrid: { show: true, instant: true },
		suggestions: { show: true, title: 'more', source: 'lds', instant: false },
		creative: { show: false },
	},
	single: {
		showFilter: true,
		showBanner: true,
		showFqdnCard: false,
		topResults: { show: true, style: 'card', instant: true },
		exactGrid: { show: true, instant: true },
		suggestions: { show: true, title: 'more', source: 'lds', instant: false },
		creative: { show: false },
	},
	keyword: {
		showFilter: true,
		showBanner: true,
		showFqdnCard: false,
		topResults: { show: true, style: 'card', instant: true },
		exactGrid: { show: true, instant: true },
		suggestions: { show: true, title: 'related', source: 'keyword', instant: false },
		creative: { show: false },
	},
	ai: {
		showFilter: true,
		showBanner: true,
		showFqdnCard: false,
		topResults: { show: true, style: 'card', instant: false },
		exactGrid: { show: false, instant: false },
		suggestions: { show: true, title: 'related', source: 'keyword', instant: false },
		creative: { show: true },
	},
};

function getMode( baseName: string, wordCount: number, isFqdn: boolean ): NamePulseMode {
	// A label needs at least two characters to be registrable.
	if ( baseName.length < 2 ) {
		return 'empty';
	}

	if ( isFqdn ) {
		return 'fqdn';
	}

	if ( wordCount >= NAME_PULSE_AI_MODE_MIN_WORDS ) {
		return 'ai';
	}

	return wordCount === 1 ? 'single' : 'keyword';
}

/**
 * Pure function of the query: which mode it is in and which sections render.
 * Whitespace splits words; a single token may be an FQDN (`coffee.com`).
 */
export function getResultsLayout(
	query: string,
	tlds: readonly string[] = NAME_PULSE_TLDS
): NamePulseResultsLayout {
	const trimmed = query.trim();
	const isMultiWord = /\s/.test( trimmed );
	const detection = isMultiWord ? null : detectFqdn( trimmed, tlds );
	const fqdn = detection?.isFqdn
		? { baseName: detection.baseName, tld: detection.tld, fullDomain: detection.fullDomain }
		: undefined;
	const baseName = fqdn
		? fqdn.baseName
		: sanitizeDomainInput( isMultiWord ? sanitizeKeywordInput( trimmed ) : trimmed );
	const wordCount = isMultiWord ? getWordCount( trimmed ) : Number( baseName.length > 0 );
	const mode = getMode( baseName, wordCount, Boolean( fqdn ) );

	return {
		mode,
		baseName,
		wordCount,
		...( fqdn ? { fqdn } : {} ),
		...SECTIONS_BY_MODE[ mode ],
	};
}
