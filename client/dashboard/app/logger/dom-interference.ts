/**
 * Cheap, one-off DOM probes that fingerprint page-mutating agents (browser
 * translation, extensions) which reparent React-managed text nodes and cause
 * `NotFoundError: Failed to execute 'insertBefore' on 'Node'` crashes in React's
 * commit phase. Run only when an error is being reported. See DOTMSD-1514.
 */

const MAX_ATTR_VALUE_LENGTH = 100;
const MAX_CUSTOM_ELEMENTS = 50;

export interface DomInterferenceReport {
	// Faceted in Sentry, so string-valued.
	tags: Record< string, string >;
	// Richer detail, attached as a Sentry context and to logstash.
	context: Record< string, unknown >;
}

function dumpAttributes( element: Element | null | undefined ): Record< string, string > {
	const dump: Record< string, string > = {};
	if ( ! element ) {
		return dump;
	}
	for ( const attribute of Array.from( element.attributes ) ) {
		// Attribute values can, in rare cases, hold user content; cap length as PII mitigation.
		dump[ attribute.name ] = attribute.value.slice( 0, MAX_ATTR_VALUE_LENGTH );
	}
	return dump;
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

		context.documentElementAttributes = dumpAttributes( html );
		context.bodyAttributes = dumpAttributes( document.body );
		context.fontCount = document.querySelectorAll< Element >( 'font' ).length;
		context.navigatorLanguages = Array.from( navigator.languages ?? [] );
		// Custom-element tag names catch unknown extensions injecting web components.
		context.customElements = Array.from(
			new Set(
				Array.from( document.querySelectorAll( '*' ) )
					.map( ( element ) => element.tagName.toLowerCase() )
					.filter( ( name ) => name.includes( '-' ) )
			)
		).slice( 0, MAX_CUSTOM_ELEMENTS );
	} catch {
		// Diagnostics must never throw while an error is already being reported.
	}

	return { tags, context };
}
