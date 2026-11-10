import { sprintf } from '@wordpress/i18n';
import type { I18n } from '@wordpress/i18n';

// Must match the strings passed to `__()` below, which have to stay literal for string extraction.
const LINE_WITH_PRODUCT = 'You’re chatting with AI from %s Support.';
const LINE_WITHOUT_PRODUCT = 'You’re chatting with AI.';

/**
 * The line that tells the user they're chatting with AI, and who for.
 * Never waits for a translation: it falls back to English, which `isEnglish` flags.
 * Takes the translation functions so a component can pass `useI18n()`'s and re-render when they change.
 */
export function getAiDisclosureLine(
	productName: string | undefined,
	{ __, hasTranslation }: Pick< I18n, '__' | 'hasTranslation' >
): {
	text: string;
	isEnglish: boolean;
} {
	const product = productName?.trim() ?? '';

	if ( ! product ) {
		return {
			text: __( 'You’re chatting with AI.', __i18n_text_domain__ ),
			isEnglish: ! hasTranslation( LINE_WITHOUT_PRODUCT, undefined, __i18n_text_domain__ ),
		};
	}

	const english = sprintf( LINE_WITH_PRODUCT, product );
	if ( ! hasTranslation( LINE_WITH_PRODUCT, undefined, __i18n_text_domain__ ) ) {
		return { text: english, isEnglish: true };
	}

	const translated = sprintf(
		/* translators: %s: product name, for example "WordPress.com" or "Woo". Keep it exactly as written: don't translate or transliterate it. */
		__( 'You’re chatting with AI from %s Support.', __i18n_text_domain__ ),
		product
	);
	// A translation that lost the product name would no longer say who the AI speaks for.
	if ( ! translated.includes( product ) || translated.trim() === product ) {
		return { text: english, isEnglish: true };
	}

	return { text: translated, isEnglish: false };
}
