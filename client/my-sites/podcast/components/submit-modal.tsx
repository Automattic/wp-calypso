import {
	Button,
	ExternalLink,
	Icon,
	Modal,
	Notice,
	TextControl,
	VisuallyHidden,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { check, external, link } from '@wordpress/icons';
import { prependHTTPS } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useHasAnyStoredPodcatcherUrl, usePodcatcherUrl } from '../hooks/use-podcatcher-url';

export type Podcatcher = {
	id: string;
	name: string;
	submitUrl: string;
	learnMoreUrl?: string;
	showHosts: string[];
};

type Props = {
	feedUrl: string;
	podcatcher: Podcatcher;
	onClose: () => void;
	onFirstSave?: () => void;
};

const COPIED_FEEDBACK_MS = 2000;

// Mirrors SHOW_URL_MAX_LENGTH in the wpcom backend.
const SHOW_URL_MAX_LENGTH = 2048;

// prependHTTPS adds the scheme for bare hosts but leaves an existing http://
// alone, so upgrade it ourselves — the backend rejects non-https.
const normalizeShowUrl = ( raw: string ): string =>
	prependHTTPS( raw.trim() ).replace( /^http:\/\//i, 'https://' );

// Mirrors the per-podcatcher allowlist + esc_url_raw + wp_http_validate_url
// gauntlet the backend runs each save through. Empty input is rejected here so
// the modal never silently deletes a stored entry by clearing the field.
const isValidShowUrl = ( url: string, allowedHosts: string[] ): boolean => {
	if ( url === '' ) {
		return false;
	}
	if ( url.length > SHOW_URL_MAX_LENGTH ) {
		return false;
	}
	let parsed: URL;
	try {
		parsed = new URL( url );
	} catch {
		return false;
	}
	if ( parsed.protocol !== 'https:' ) {
		return false;
	}
	const host = parsed.hostname.toLowerCase().replace( /^www\./, '' );
	return allowedHosts.includes( host );
};

const SubmitModal = ( { feedUrl, podcatcher, onClose, onFirstSave }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const [ storedUrl, setStoredUrl ] = usePodcatcherUrl( siteId, podcatcher.id );
	const hadAnyStoredUrl = useHasAnyStoredPodcatcherUrl( siteId );
	const [ draftUrl, setDraftUrl ] = useState( storedUrl );
	const [ hasCopied, setHasCopied ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ isEditing, setIsEditing ] = useState( false );
	const [ saveError, setSaveError ] = useState< string | null >( null );
	const copyTimeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const inputContainerRef = useRef< HTMLDivElement >( null );
	// `storedUrl` may be empty on mount if site settings haven't hydrated yet;
	// once it lands, mirror it into the draft. We flip this ref whenever the
	// draft is touched (sync, typing, or Replace) so late hydration can never
	// clobber input the user has already started.
	const hasInitializedDraft = useRef( !! storedUrl );
	// Set when Replace is clicked so the post-render effect knows to move
	// focus into the now-mounted input. We don't trigger on every isEditing
	// flip — typing also flips it, and grabbing focus mid-keystroke would be
	// disruptive.
	const shouldFocusInputRef = useRef( false );

	useEffect(
		() => () => {
			if ( copyTimeoutRef.current ) {
				clearTimeout( copyTimeoutRef.current );
			}
		},
		[]
	);

	useEffect( () => {
		if ( ! hasInitializedDraft.current && storedUrl ) {
			hasInitializedDraft.current = true;
			setDraftUrl( storedUrl );
		}
	}, [ storedUrl ] );

	useEffect( () => {
		if ( ! shouldFocusInputRef.current || ! isEditing ) {
			return;
		}
		shouldFocusInputRef.current = false;
		const input = inputContainerRef.current?.querySelector( 'input' );
		input?.focus();
		// Pre-select so the user can type over the existing URL immediately.
		input?.select();
	}, [ isEditing ] );

	const handleCopy = async () => {
		if ( ! feedUrl || ! navigator.clipboard?.writeText ) {
			return;
		}
		try {
			await navigator.clipboard.writeText( feedUrl );
			setHasCopied( true );
			if ( copyTimeoutRef.current ) {
				clearTimeout( copyTimeoutRef.current );
			}
			copyTimeoutRef.current = setTimeout( () => setHasCopied( false ), COPIED_FEEDBACK_MS );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Podcast: failed to copy RSS feed URL to clipboard', error );
		}
	};

	const serviceArgs = {
		args: { service: podcatcher.name },
		comment: '%(service)s is a podcast directory name, e.g. "Spotify" or "Apple Podcasts".',
	};

	const invalidUrlError = translate( 'Enter a valid %(service)s URL.', serviceArgs ) as string;
	const saveFailedError = translate(
		'We couldn’t save your %(service)s URL. Please try again.',
		serviceArgs
	) as string;

	const normalizedDraft = normalizeShowUrl( draftUrl );
	const isUnchanged = draftUrl === storedUrl;

	const handleSave = async ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( ! isValidShowUrl( normalizedDraft, podcatcher.showHosts ) ) {
			setSaveError( invalidUrlError );
			return;
		}
		// Capture before the dispatch — hadAnyStoredUrl flips to true once the
		// save lands, so without snapshotting we'd never qualify as a first save.
		// `null` (settings not yet hydrated) is preserved as null so we can skip
		// confetti rather than guess.
		const isFirstEverSave = hadAnyStoredUrl === null ? null : ! hadAnyStoredUrl;
		setIsSaving( true );
		setSaveError( null );
		try {
			await setStoredUrl( normalizedDraft );
			dispatch(
				recordTracksEvent( 'calypso_podcast_show_url_saved', {
					directory: podcatcher.id,
					is_first_save: isFirstEverSave,
					is_replace: !! storedUrl,
				} )
			);
			// Only celebrate when we definitively know there were no prior URLs.
			// `null` means site settings hadn't hydrated yet — skip confetti so a
			// returning user on a fresh tab doesn't get a spurious celebration.
			if ( isFirstEverSave === true ) {
				onFirstSave?.();
			}
			onClose();
		} catch {
			setSaveError( saveFailedError );
		} finally {
			setIsSaving( false );
		}
	};

	const step2Note =
		podcatcher.id === 'pocketcasts'
			? translate( 'Choose the Public option, since this feed is for your listeners.' )
			: null;

	return (
		<Modal
			title={ translate( 'Submit to %(service)s', serviceArgs ) as string }
			onRequestClose={ onClose }
			className="podcast__submit-modal"
		>
			<VStack as="ol" spacing={ 5 } className="podcast__submit-steps">
				<VStack as="li" spacing={ 3 } className="podcast__submit-step">
					<h2 className="podcast__submit-step-title">
						{ translate( 'Step 1: Copy your RSS feed URL' ) }
					</h2>
					<Text as="p" variant="muted">
						{ feedUrl
							? translate(
									'Click the button below to copy your RSS feed URL. %(service)s will require this URL to list your podcast.',
									serviceArgs
							  )
							: translate(
									'Set your podcast category in the Settings tab to generate your RSS feed URL.'
							  ) }
					</Text>
					{ feedUrl && (
						<Button
							className="podcast__submit-copy-button"
							variant="secondary"
							__next40pxDefaultSize
							icon={ link }
							iconPosition="left"
							onClick={ handleCopy }
						>
							{ hasCopied ? translate( 'Copied!' ) : translate( 'Copy link' ) }
						</Button>
					) }
				</VStack>

				<VStack as="li" spacing={ 3 } className="podcast__submit-step">
					<h2 className="podcast__submit-step-title">
						{ translate( 'Step 2: Submit your podcast to %(service)s', serviceArgs ) }
					</h2>
					<Text as="p" variant="muted">
						{ podcatcher.learnMoreUrl
							? translate(
									'Click the button below to visit %(service)s and complete their sign up flow. {{a}}Learn more{{/a}}.',
									{
										args: { service: podcatcher.name },
										comment:
											'%(service)s is a podcast directory name. {{a}}…{{/a}} wraps a link to documentation about submitting a podcast to that directory.',
										components: {
											// Children are replaced by i18n-calypso at render time; placeholder text only satisfies the type.
											a: <ExternalLink href={ podcatcher.learnMoreUrl }>link</ExternalLink>,
										},
									}
							  )
							: translate(
									'Click the button below to visit %(service)s and complete their sign up flow.',
									serviceArgs
							  ) }
					</Text>
					{ step2Note && (
						<Text as="p" variant="muted">
							{ step2Note }
						</Text>
					) }
					<Button
						variant="secondary"
						__next40pxDefaultSize
						icon={ external }
						iconPosition="right"
						href={ podcatcher.submitUrl }
						target="_blank"
						rel="noopener noreferrer"
						aria-label={
							translate( 'Visit %(service)s (opens in a new tab)', serviceArgs ) as string
						}
					>
						{ translate( 'Visit %(service)s', serviceArgs ) }
					</Button>
				</VStack>

				<VStack as="li" spacing={ 3 } className="podcast__submit-step">
					<h2 className="podcast__submit-step-title">
						{ translate( 'Step 3: Enter your %(service)s URL', serviceArgs ) }
					</h2>
					<Text as="p" variant="muted">
						{ translate(
							'Paste your new %(service)s URL into the field below and we’ll use it for your sharing buttons.',
							serviceArgs
						) }
					</Text>
					{ storedUrl && ! isEditing ? (
						<HStack spacing={ 2 } alignment="center" className="podcast__submit-step-row">
							<HStack
								spacing={ 2 }
								alignment="center"
								expanded={ false }
								justify="flex-start"
								className="podcast__submit-step-saved"
							>
								<Icon
									icon={ check }
									className="podcast__submit-step-saved-icon"
									aria-hidden="true"
								/>
								<VisuallyHidden>{ translate( 'Saved:' ) }</VisuallyHidden>
								<Text className="podcast__submit-step-saved-url" title={ storedUrl }>
									{ storedUrl }
								</Text>
							</HStack>
							<Button
								variant="secondary"
								__next40pxDefaultSize
								aria-label={ translate( 'Replace %(service)s URL', serviceArgs ) as string }
								onClick={ () => {
									hasInitializedDraft.current = true;
									shouldFocusInputRef.current = true;
									setDraftUrl( storedUrl );
									setSaveError( null );
									setIsEditing( true );
								} }
							>
								{ translate( 'Replace' ) }
							</Button>
						</HStack>
					) : (
						<form className="podcast__submit-step-form" onSubmit={ handleSave }>
							<HStack spacing={ 2 } alignment="center" className="podcast__submit-step-row">
								<div className="podcast__submit-step-field" ref={ inputContainerRef }>
									<TextControl
										label={ translate( '%(service)s URL', serviceArgs ) as string }
										hideLabelFromVision
										value={ draftUrl }
										onChange={ ( value ) => {
											hasInitializedDraft.current = true;
											// Pin the form open so a late `storedUrl` hydration
											// can't swap us back to the saved/read-only view
											// mid-keystroke.
											setIsEditing( true );
											setDraftUrl( value );
											setSaveError( null );
										} }
										placeholder="https://"
										type="text"
										inputMode="url"
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
								</div>
								<Button
									variant="primary"
									__next40pxDefaultSize
									type="submit"
									disabled={ ! normalizedDraft || isUnchanged || isSaving }
									isBusy={ isSaving }
									accessibleWhenDisabled
								>
									{ translate( 'Save' ) }
								</Button>
							</HStack>
							{ saveError && (
								<Notice
									status="error"
									isDismissible
									onRemove={ () => setSaveError( null ) }
									className="podcast__submit-step-notice"
								>
									{ saveError }
								</Notice>
							) }
						</form>
					) }
				</VStack>
			</VStack>
		</Modal>
	);
};

export default SubmitModal;
