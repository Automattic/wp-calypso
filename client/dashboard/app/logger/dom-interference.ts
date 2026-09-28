/**
 * Cheap, one-off DOM probes that fingerprint page-mutating agents (browser
 * translation, extensions) which reparent React-managed text nodes and cause
 * `NotFoundError: Failed to execute 'insertBefore' on 'Node'` crashes in React's
 * commit phase. Run only when an error is being reported.
 */

export interface DomInterferenceReport {
	// Faceted in Sentry, so string-valued.
	tags: Record< string, string >;
	// Richer detail, attached as a Sentry context and to logstash.
	context: Record< string, unknown >;
}

/**
 * Collect a fingerprint of DOM-mutating agents active on the page at error time.
 */
export function getDomInterferenceReport(): DomInterferenceReport {
	const tags: Record< string, string > = {};
	const context: Record< string, unknown > = {};

	try {
		const html = document.documentElement;

		// Google Translate: toggles translated-ltr/rtl on <html> and wraps text in <font>.
		tags.dom_google_translate = String(
			html.classList.contains( 'translated-ltr' ) ||
				html.classList.contains( 'translated-rtl' ) ||
				document.querySelector( 'font[style*="vertical-align"]' ) !== null
		);

		// Edge built-in translate: stamps _msttexthash attributes on translated nodes.
		tags.dom_ms_translate = String( document.querySelector( '[_msttexthash]' ) !== null );

		// Immersive Translate extension.
		tags.dom_immersive_translate = String(
			document.querySelector( '[class*="immersive-translate"]' ) !== null
		);

		// Grammarly.
		tags.dom_grammarly = String(
			document.querySelector(
				'[data-gr-ext-installed], grammarly-extension, grammarly-desktop-integration'
			) !== null
		);

		// Dark Reader.
		tags.dom_dark_reader = String( document.querySelector( 'style.darkreader' ) !== null );

		tags.dom_doc_lang = html.lang || '';

		// Every probe above keys on a DOM artefact only Chromium and extension
		// translators leave behind. Safari and Firefox translate text nodes in
		// place with no marker, so a `false` there means "undetectable", not
		// "not translated".
		tags.dom_probe_coverage = /Chrome|Chromium|Edg\//.test( navigator.userAgent )
			? 'full'
			: 'partial';

		context.fontCount = document.querySelectorAll< Element >( 'font' ).length;
	} catch {
		// Diagnostics must never throw while an error is already being reported.
	}

	return { tags, context };
}
