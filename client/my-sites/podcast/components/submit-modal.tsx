import {
	Button,
	ExternalLink,
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { external, link } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useFeedUrl } from '../hooks/use-feed-url';
import {
	hasCelebratedFirstSave,
	markCelebratedFirstSave,
	usePodcatcherUrl,
} from '../hooks/use-podcatcher-url';

export type Podcatcher = {
	id: string;
	name: string;
	submitUrl: string;
	learnMoreUrl?: string;
};

type Props = {
	podcatcher: Podcatcher;
	onClose: () => void;
	onFirstSave?: () => void;
};

const COPIED_FEEDBACK_MS = 2000;

const SubmitModal = ( { podcatcher, onClose, onFirstSave }: Props ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const feedUrl = useFeedUrl();
	const [ storedUrl, setStoredUrl ] = usePodcatcherUrl( siteId, podcatcher.id );
	const [ draftUrl, setDraftUrl ] = useState( storedUrl );
	const [ hasCopied, setHasCopied ] = useState( false );
	const copyTimeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );

	useEffect(
		() => () => {
			if ( copyTimeoutRef.current ) {
				clearTimeout( copyTimeoutRef.current );
			}
		},
		[]
	);

	const handleCopy = () => {
		if ( ! feedUrl ) {
			return;
		}
		navigator.clipboard
			.writeText( feedUrl )
			.then( () => {
				setHasCopied( true );
				if ( copyTimeoutRef.current ) {
					clearTimeout( copyTimeoutRef.current );
				}
				copyTimeoutRef.current = setTimeout( () => setHasCopied( false ), COPIED_FEEDBACK_MS );
			} )
			.catch( () => {
				/* clipboard unavailable — ignore */
			} );
	};

	const handleSave = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		const trimmed = draftUrl.trim();
		setStoredUrl( trimmed );
		if ( trimmed && ! hasCelebratedFirstSave( siteId ) ) {
			markCelebratedFirstSave( siteId );
			onFirstSave?.();
		}
		onClose();
	};

	const isUnchanged = draftUrl.trim() === storedUrl.trim();

	const serviceArgs = {
		args: { service: podcatcher.name },
		comment: '%(service)s is a podcast directory name, e.g. "Spotify" or "Apple Podcasts".',
	};

	// Service-specific tip rendered alongside step 2. Substack adds a similar hint
	// for Pocket Casts so users pick the right submission option.
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
						{ translate(
							'Click the button below to visit %(service)s and complete their sign up flow.',
							serviceArgs
						) }
						{ step2Note && <> { step2Note }</> }
						{ podcatcher.learnMoreUrl && (
							<>
								{ ' ' }
								<ExternalLink
									href={ podcatcher.learnMoreUrl }
									aria-label={
										translate( 'Learn more about submitting to %(service)s', serviceArgs ) as string
									}
								>
									{ translate( 'Learn more' ) }
								</ExternalLink>
							</>
						) }
					</Text>
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
					<HStack
						as="form"
						spacing={ 2 }
						className="podcast__submit-step-form"
						onSubmit={ handleSave }
					>
						<div className="podcast__submit-step-field">
							<TextControl
								label={ translate( '%(service)s URL', serviceArgs ) as string }
								hideLabelFromVision
								value={ draftUrl }
								onChange={ setDraftUrl }
								placeholder="https://"
								type="url"
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						</div>
						<Button
							variant="primary"
							__next40pxDefaultSize
							type="submit"
							disabled={ isUnchanged }
							accessibleWhenDisabled
						>
							{ translate( 'Save' ) }
						</Button>
					</HStack>
				</VStack>
			</VStack>
		</Modal>
	);
};

export default SubmitModal;
