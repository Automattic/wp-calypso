import { Button, Dropdown, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useConnectedSites from './hooks/use-connected-sites';

const RECENT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 150;

/**
 * Normalize a user-typed URL. If the user did not include a scheme, prepend
 * `https://` and then validate. Returns the canonical href on success, or
 * null if the input is empty or does not parse to a valid http/https URL.
 *
 * Examples:
 *   "acme.com"               → "https://acme.com/"
 *   "https://acme.com"       → "https://acme.com/"
 *   "acme.com/team?ref=1"    → "https://acme.com/team?ref=1"
 *   "  acme.com  "           → "https://acme.com/"  (trims surrounding space)
 *   ""                       → null
 *   "ftp://acme.com"         → null  (only http/https allowed)
 *   "javascript:alert(1)"    → null  (only http/https allowed)
 *   "not a url"              → null  (no hostname after prepend)
 *
 * The auto-prepend matches the downstream Worker's protocol requirements
 * (see workers/amplify-api/index.ts: parsed.protocol must be http: or
 * https:), so we fail fast at the input boundary instead of round-tripping
 * to the Worker for it to return 400.
 */
function normalizeUrl( raw: string ): string | null {
	const trimmed = raw.trim();
	if ( ! trimmed ) {
		return null;
	}
	const withScheme = /^https?:\/\//i.test( trimmed ) ? trimmed : `https://${ trimmed }`;
	try {
		const parsed = new URL( withScheme );
		if ( parsed.protocol !== 'http:' && parsed.protocol !== 'https:' ) {
			return null;
		}
		// Require either a multi-label hostname (e.g. "acme.com") or literal
		// "localhost". A bare unqualified label like "foo" parses successfully
		// as `https://foo/` but is almost always a typo of a real URL, and the
		// Worker / Trigger pipeline would just spend tokens on a DNS failure.
		if ( parsed.hostname !== 'localhost' && ! parsed.hostname.includes( '.' ) ) {
			return null;
		}
		return parsed.href;
	} catch {
		return null;
	}
}

type Props = {
	/**
	 * Called when the user hits "Amplify it." AmplifyPage owns the analysis
	 * modal — this component just signals which URL to analyze.
	 */
	onSiteSelected: ( url: string ) => void;
};

export default function AmplifySiteSelect( { onSiteSelected }: Props ) {
	const dispatch = useDispatch();

	// Two input paths, mutually exclusive on submit:
	//   1. `urlInput` — the user typed a URL directly. Validated and
	//      normalised (https:// auto-prepended) only at submit time.
	//   2. `selectedSiteUrl` — the user picked from the connected-sites
	//      dropdown. Already a canonical URL from the wpcom API.
	// Typing in one clears the other. The submit button reads whichever is
	// currently populated; the `entry_point` Tracks property records which.
	const [ urlInput, setUrlInput ] = useState( '' );
	const [ selectedSiteUrl, setSelectedSiteUrl ] = useState< string | null >( null );

	// `submitError` is set only when the user clicks "Amplify it" with an
	// unparseable URL. We deliberately do NOT validate while the user is
	// typing — interim states like "ac" or "acme" would otherwise flash a
	// red error before the user has finished, which we saw produce a
	// jarring "invalid" state mid-keystroke. The error clears as soon as
	// the user resumes typing or picks a site from the dropdown.
	const [ submitError, setSubmitError ] = useState< string | null >( null );

	// `searchInput` is the controlled value bound to the dropdown's TextControl
	// so the field stays responsive to keystrokes. `debouncedSearch` is what we
	// feed into useConnectedSites, so the filter only re-runs after the user
	// pauses typing. Keeps the dropdown smooth on accounts with many connected
	// sites.
	const [ searchInput, setSearchInput ] = useState( '' );
	const [ debouncedSearch, setDebouncedSearch ] = useState( '' );

	useEffect( () => {
		if ( searchInput === debouncedSearch ) {
			return;
		}
		const timer = setTimeout( () => {
			setDebouncedSearch( searchInput );
		}, SEARCH_DEBOUNCE_MS );
		return () => clearTimeout( timer );
	}, [ searchInput, debouncedSearch ] );

	const { sites, isLoading, hasAnyConnectedSites } = useConnectedSites( {
		search: debouncedSearch,
		limit: RECENT_LIMIT,
	} );

	const isDropdownDisabled = isLoading || ! hasAnyConnectedSites;

	let toggleText: string;
	if ( selectedSiteUrl ) {
		toggleText = selectedSiteUrl;
	} else if ( isLoading ) {
		toggleText = __( 'Loading sites…' );
	} else if ( ! hasAnyConnectedSites ) {
		toggleText = __( 'No connected sites yet' );
	} else {
		toggleText = __( 'Choose a site' );
	}

	// The submit button is enabled whenever the user has provided either
	// input. We don't gate enablement on URL validity because validity is
	// only computed at submit time — `handleAmplifyClick` is what decides
	// whether to surface a submit-time error or proceed with the analysis.
	const hasUrlInput = urlInput.trim().length > 0;
	const canSubmit = hasUrlInput || !! selectedSiteUrl;

	const handleUrlChange = ( next: string ) => {
		setUrlInput( next );
		// Clear any submit-time error as soon as the user resumes typing,
		// so the error doesn't linger over a corrected input until they
		// click submit again.
		if ( submitError ) {
			setSubmitError( null );
		}
		// Mutual exclusivity: typing in the URL field clears any prior
		// dropdown selection so "Amplify it" can't ambiguously refer to both.
		if ( next.trim().length > 0 && selectedSiteUrl ) {
			setSelectedSiteUrl( null );
		}
	};

	const handleSelectSite = ( url: string ) => {
		setSelectedSiteUrl( url );
		if ( submitError ) {
			setSubmitError( null );
		}
		// Mutual exclusivity in the other direction.
		if ( urlInput ) {
			setUrlInput( '' );
		}
		dispatch( recordTracksEvent( 'calypso_a4a_amplify_site_select', { site_url: url } ) );
	};

	const handleAmplifyClick = () => {
		// Resolve the URL to submit. URL input takes priority over the
		// dropdown selection (the mutual-exclusivity logic above means at
		// most one is non-empty in steady state; the explicit if/else
		// makes the intent obvious in case that ever drifts).
		let target: string | null = null;
		let entryPoint: 'hero_url_input' | 'hero_connected_sites';

		if ( hasUrlInput ) {
			const normalized = normalizeUrl( urlInput );
			if ( ! normalized ) {
				setSubmitError(
					__( 'That doesn’t look like a valid URL. Try something like https://example.com.' )
				);
				return;
			}
			target = normalized;
			entryPoint = 'hero_url_input';
		} else if ( selectedSiteUrl ) {
			target = selectedSiteUrl;
			entryPoint = 'hero_connected_sites';
		} else {
			// Defensive — the button is disabled in this state, but if it
			// somehow gets clicked anyway we just no-op.
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_a4a_amplify_audit_open', {
				site_url: target,
				entry_point: entryPoint,
			} )
		);
		onSiteSelected( target );
	};

	return (
		<>
			<div className="amplify-landing-selector">
				<div className="amplify-landing-selector-fields">
					<div className="amplify-landing-selector-field amplify-landing-selector-field-url">
						<span className="amplify-landing-selector-label">{ __( 'Enter a URL' ) }</span>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Site URL' ) }
							hideLabelFromVision
							// Use `type="text"` (not `type="url"`) plus `inputMode="url"`
							// to suppress Chrome's URL-history autocomplete popup
							// while preserving the URL keyboard layout on mobile.
							// Chrome ignores `autoComplete="off"` on `type="url"`
							// inputs and shows the address-bar history regardless;
							// switching to text bypasses that special-case. URL
							// validation is handled client-side via normalizeUrl()
							// at submit time, so we don't lose anything by skipping
							// the HTML5 type="url" pattern matching.
							type="text"
							inputMode="url"
							value={ urlInput }
							onChange={ handleUrlChange }
							placeholder="https://yourgroovydomain.com"
							className="amplify-landing-selector-url-input"
							aria-invalid={ !! submitError }
							aria-errormessage={ submitError ? 'amplify-landing-selector-error' : undefined }
							autoComplete="off"
							autoCorrect="off"
							spellCheck={ false }
						/>
					</div>

					<span className="amplify-landing-selector-or" aria-hidden="true">
						{ __( 'or' ) }
					</span>

					<div className="amplify-landing-selector-field amplify-landing-selector-field-dropdown">
						<span className="amplify-landing-selector-label">
							{ __( 'Pick a connected site' ) }
						</span>
						<Dropdown
							className="amplify-landing-site-dropdown"
							contentClassName="amplify-landing-site-dropdown-content"
							placement="bottom-start"
							popoverProps={ { offset: 4, shift: true } }
							onToggle={ ( isOpen ) => {
								if ( ! isOpen ) {
									setSearchInput( '' );
									setDebouncedSearch( '' );
								}
							} }
							renderToggle={ ( { isOpen, onToggle } ) => (
								<button
									type="button"
									className={ clsx( 'amplify-landing-site-dropdown-toggle', {
										'is-open': isOpen,
									} ) }
									disabled={ isDropdownDisabled }
									aria-expanded={ isOpen }
									aria-haspopup="listbox"
									onClick={ onToggle }
								>
									<span
										className={ clsx( 'amplify-landing-site-dropdown-value', {
											'is-placeholder': ! selectedSiteUrl,
										} ) }
									>
										{ toggleText }
									</span>
									<Icon icon={ chevronDown } size={ 20 } />
								</button>
							) }
							renderContent={ ( { onClose } ) => (
								<div className="amplify-landing-site-dropdown-panel">
									<div className="amplify-landing-site-dropdown-search">
										<TextControl
											__nextHasNoMarginBottom
											__next40pxDefaultSize
											label={ __( 'Search' ) }
											hideLabelFromVision
											value={ searchInput }
											onChange={ setSearchInput }
											placeholder={ __( 'Search connected sites' ) }
										/>
									</div>
									{ sites.length === 0 ? (
										<p className="amplify-landing-site-dropdown-empty">{ __( 'No matches' ) }</p>
									) : (
										<ul className="amplify-landing-site-dropdown-list" role="listbox">
											{ sites.map( ( site ) => {
												const isSelected = site.url === selectedSiteUrl;
												return (
													<li key={ site.id }>
														<button
															type="button"
															role="option"
															aria-selected={ isSelected }
															className={ clsx( 'amplify-landing-site-dropdown-item', {
																'is-selected': isSelected,
															} ) }
															onClick={ () => {
																handleSelectSite( site.url );
																onClose();
															} }
														>
															{ site.url }
														</button>
													</li>
												);
											} ) }
										</ul>
									) }
								</div>
							) }
						/>
					</div>
				</div>

				<Button
					__next40pxDefaultSize
					variant="primary"
					disabled={ ! canSubmit }
					onClick={ handleAmplifyClick }
					className="amplify-landing-selector-submit"
				>
					{ __( 'Amplify it' ) }
				</Button>
			</div>
			{ submitError && (
				<p
					id="amplify-landing-selector-error"
					className="amplify-landing-selector-error"
					role="alert"
				>
					{ submitError }
				</p>
			) }
		</>
	);
}
