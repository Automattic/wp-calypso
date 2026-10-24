/**
 * Keeps a wp-admin settings screen in step with settings the agent saves.
 *
 * Settings screens are server-rendered forms that post every field, so a field
 * still showing the old value would put it back the next time the user saves.
 * After a tool finishes, the screen re-reads `/wp/v2/settings` and compares it
 * with what the form loaded, so it follows any tool that writes settings without
 * knowing its result's shape. A field the user has not touched takes the saved
 * value; one they have edited is left alone and a notice says the saved value
 * changed, since overwriting it would discard their edit.
 *
 * `/wp/v2/settings` covers only the settings registered with `show_in_rest`:
 * everything on General and Writing, but not `blog_public` or most discussion
 * settings. A field it does not cover is left as it is.
 */
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import {
	ABILITY_COMPLETED_EVENT,
	TOOL_RESULT_EVENT,
	type AbilityCompletedDetail,
} from './agent-activity-events';

type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | RadioNodeList;

/** A tool's results tend to come in bursts; one read covers the burst. */
const REFRESH_DELAY_MS = 500;

const NOTICE_ID_PREFIX = 'agents-manager-settings-sync-notice-';
const SAVED_NOTICE_ID = 'setting-error-settings_updated';

/** Core's REST names for settings whose option is named differently. */
const OPTION_NAMES: Record< string, string > = {
	title: 'blogname',
	description: 'blogdescription',
	url: 'siteurl',
	email: 'admin_email',
	timezone: 'timezone_string',
	language: 'WPLANG',
};

/** Core's admin bar cuts the site name to this many characters. */
const ADMIN_BAR_TITLE_LENGTH = 40;

let refreshTimer: ReturnType< typeof setTimeout > | undefined;
let latestRefresh = 0;

function getSettingsForm(): HTMLFormElement | null {
	return document.querySelector< HTMLFormElement >( 'form[action="options.php"]' );
}

function getRadios( field: RadioNodeList ): HTMLInputElement[] {
	return Array.from( field ).filter(
		( node ): node is HTMLInputElement => node instanceof HTMLInputElement && node.type === 'radio'
	);
}

function isCheckbox( field: FormField ): field is HTMLInputElement {
	return field instanceof HTMLInputElement && field.type === 'checkbox';
}

function getDefaultOption( field: HTMLSelectElement ): HTMLOptionElement | undefined {
	const options = Array.from( field.options );
	return options.find( ( option ) => option.defaultSelected ) ?? options[ 0 ];
}

/** Whether a checkbox showing `value` would be checked. Checkboxes post their own `value` (`1`, `open`). */
function isCheckedFor( field: HTMLInputElement, value: unknown ): boolean {
	return value === true || String( value ?? '' ) === field.value;
}

/**
 * Whether the field can show the value at all. A custom date format, a UTC
 * offset timezone and the like have no radio or option of their own.
 */
function canShow( field: FormField, text: string ): boolean {
	if ( field instanceof RadioNodeList ) {
		return getRadios( field ).some( ( radio ) => radio.value === text );
	}
	if ( field instanceof HTMLSelectElement ) {
		return Array.from( field.options ).some( ( option ) => option.value === text );
	}
	return true;
}

/** Whether the field loaded with this value, so nothing has changed since. */
function loadedWith( field: FormField, value: unknown, text: string ): boolean {
	if ( field instanceof RadioNodeList ) {
		return getRadios( field ).some( ( radio ) => radio.defaultChecked && radio.value === text );
	}
	if ( isCheckbox( field ) ) {
		return field.defaultChecked === isCheckedFor( field, value );
	}
	if ( field instanceof HTMLSelectElement ) {
		return getDefaultOption( field )?.value === text;
	}
	return field.defaultValue === text;
}

/** Whether the user has changed the field since the page loaded. */
function isEdited( field: FormField ): boolean {
	if ( field instanceof RadioNodeList ) {
		return getRadios( field ).some( ( radio ) => radio.checked !== radio.defaultChecked );
	}
	if ( isCheckbox( field ) ) {
		return field.checked !== field.defaultChecked;
	}
	if ( field instanceof HTMLSelectElement ) {
		return field.value !== ( getDefaultOption( field )?.value ?? '' );
	}
	return field.value !== field.defaultValue;
}

/**
 * Put the value in the field, and make it the field's default too so the next
 * read is compared with what is saved now.
 */
function setSavedValue( field: FormField, value: unknown, text: string ): void {
	if ( field instanceof RadioNodeList ) {
		getRadios( field ).forEach( ( radio ) => {
			radio.checked = radio.defaultChecked = radio.value === text;
		} );
	} else if ( isCheckbox( field ) ) {
		field.checked = field.defaultChecked = isCheckedFor( field, value );
	} else if ( field instanceof HTMLSelectElement ) {
		Array.from( field.options ).forEach( ( option ) => {
			option.defaultSelected = option.value === text;
		} );
		// After the defaults: changing them resets the selection of a select the
		// user has not touched.
		field.value = text;
	} else {
		field.value = field.defaultValue = text;
	}
}

function getFieldLabel( form: HTMLFormElement, name: string, field: FormField ): string {
	const id = field instanceof RadioNodeList ? '' : field.id;
	const label = id ? form.querySelector( `label[for="${ CSS.escape( id ) }"]` ) : null;

	return label?.textContent?.trim() || name;
}

function showStaleNotice( form: HTMLFormElement, name: string, field: FormField ): void {
	const id = NOTICE_ID_PREFIX + name;
	document.getElementById( id )?.remove();

	const notice = document.createElement( 'div' );
	notice.id = id;
	notice.className = 'notice notice-warning';
	const paragraph = document.createElement( 'p' );
	paragraph.textContent = sprintf(
		/* translators: %s: the label of a settings field, e.g. "Site Title". */
		__(
			'The AI assistant changed “%s” while you were editing it. Reload the page to see the saved value, or save to keep yours.',
			__i18n_text_domain__
		),
		getFieldLabel( form, name, field )
	);
	notice.append( paragraph );
	form.before( notice );
}

/**
 * The notice core shows after the user saves a settings screen, with the same
 * id and classes, so it looks the same and replaces one already showing.
 */
function showSavedNotice( form: HTMLFormElement ): void {
	document.getElementById( SAVED_NOTICE_ID )?.remove();

	const notice = document.createElement( 'div' );
	notice.id = SAVED_NOTICE_ID;
	notice.className = 'notice notice-success settings-error is-dismissible';
	const paragraph = document.createElement( 'p' );
	const strong = document.createElement( 'strong' );
	strong.textContent = __( 'Settings saved.', __i18n_text_domain__ );
	paragraph.append( strong );
	notice.append( paragraph );
	form.before( notice );

	// Core's `common.js` adds the dismiss button to notices it hears about.
	( window as { jQuery?: ( target: Document ) => { trigger: ( name: string ) => void } } )
		.jQuery?.( document )
		.trigger( 'wp-updates-notice-added' );
}

/**
 * The site name as core's admin bar prints it: `wp_html_excerpt()` cuts the
 * stored, escaped name, dropping an entity the cut splits, and an empty name
 * falls back to the site's host.
 */
function getAdminBarTitle( stored: string ): string {
	if ( ! stored ) {
		return window.location.host.replace( /^www\./, '' );
	}
	if ( stored.length <= ADMIN_BAR_TITLE_LENGTH ) {
		return decodeEntities( stored );
	}

	const excerpt = stored.slice( 0, ADMIN_BAR_TITLE_LENGTH ).replace( /&[^;\s]*$/, '' );
	return decodeEntities( excerpt ) + '…';
}

/**
 * The site name also shows in the admin bar and the tab title.
 * @param stored   The name as stored, escaped.
 * @param previous The name the page loaded with, when the form had it.
 */
function syncSiteTitle( stored: string, previous: string | undefined ): void {
	const siteName = document.querySelector( '#wp-admin-bar-site-name > .ab-item' );
	// Only the text: the link can also hold the site icon's `<img>`.
	const nameNode = Array.from( siteName?.childNodes ?? [] ).find(
		( node ) => node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()
	);
	const title = decodeEntities( stored );

	if ( nameNode ) {
		nameNode.nodeValue = getAdminBarTitle( stored );
	}
	if ( previous && title && previous !== title && document.title.includes( previous ) ) {
		document.title = document.title.replace( previous, title );
	}
}

/**
 * Show what is saved in every field the screen has for it.
 * @param settings `/wp/v2/settings`, keyed by REST name.
 */
export function applySavedSettings( settings: Record< string, unknown > ): void {
	const form = getSettingsForm();
	if ( ! form ) {
		return;
	}

	let didUpdate = false;

	for ( const [ restName, stored ] of Object.entries( settings ) ) {
		const name = OPTION_NAMES[ restName ] ?? restName;
		const field = form.elements.namedItem( name ) as FormField | null;
		// Options are returned as stored, and core stores some escaped (`blogname`
		// goes through `esc_html()`). The screen prints them into HTML, which
		// decodes them once, so a field set from script must too.
		const value = typeof stored === 'string' ? decodeEntities( stored ) : stored;
		// Core stores English as an empty `WPLANG`, which REST reports as `en_US`.
		const text = name === 'WPLANG' && value === 'en_US' ? '' : String( value ?? '' );

		// Screens without a site title field still show it in the admin bar.
		if ( name === 'blogname' && ! field ) {
			syncSiteTitle( String( stored ?? '' ), undefined );
		}

		if ( ! field || ! canShow( field, text ) || loadedWith( field, value, text ) ) {
			continue;
		}

		const previous = field instanceof HTMLInputElement ? field.defaultValue : undefined;

		if ( isEdited( field ) ) {
			showStaleNotice( form, name, field );
		} else {
			setSavedValue( field, value, text );
			document.getElementById( NOTICE_ID_PREFIX + name )?.remove();
			didUpdate = true;
		}

		if ( name === 'blogname' ) {
			syncSiteTitle( String( stored ?? '' ), previous );
		}
	}

	if ( didUpdate ) {
		showSavedNotice( form );
	}
}

async function refresh(): Promise< void > {
	const request = ++latestRefresh;

	let settings: Record< string, unknown >;
	try {
		settings = await apiFetch< Record< string, unknown > >( { path: '/wp/v2/settings' } );
	} catch {
		// The screen keeps what it shows; a reload still shows what is saved.
		return;
	}

	// A later read is on its way, and it knows more.
	if ( request === latestRefresh ) {
		applySavedSettings( settings );
	}
}

function scheduleRefresh( event: Event ): void {
	if ( event.type === ABILITY_COMPLETED_EVENT ) {
		const { ok } = ( event as CustomEvent< AbilityCompletedDetail > ).detail ?? {};
		if ( ! ok ) {
			return;
		}
	}
	if ( ! getSettingsForm() ) {
		return;
	}

	clearTimeout( refreshTimer );
	refreshTimer = setTimeout( refresh, REFRESH_DELAY_MS );
}

/**
 * Start re-reading the screen's settings whenever a tool finishes.
 * @returns Stops it.
 */
export function installWpAdminSettingsSync(): () => void {
	window.addEventListener( TOOL_RESULT_EVENT, scheduleRefresh );
	window.addEventListener( ABILITY_COMPLETED_EVENT, scheduleRefresh );

	return () => {
		clearTimeout( refreshTimer );
		window.removeEventListener( TOOL_RESULT_EVENT, scheduleRefresh );
		window.removeEventListener( ABILITY_COMPLETED_EVENT, scheduleRefresh );
	};
}
