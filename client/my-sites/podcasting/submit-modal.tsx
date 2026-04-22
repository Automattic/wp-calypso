import { Button, ExternalLink, Modal } from '@wordpress/components';
import { external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, type FormEvent } from 'react';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { usePodcastingFeedUrl } from './use-feed-url';
import { usePodcatcherUrl } from './use-podcatcher-url';

export type Podcatcher = {
	id: string;
	name: string;
	submitUrl: string;
	learnMoreUrl?: string;
	logo: JSX.Element;
};

type Props = {
	podcatcher: Podcatcher;
	onClose: () => void;
};

const SubmitModal = ( { podcatcher, onClose }: Props ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const feedUrl = usePodcastingFeedUrl();
	const [ storedUrl, setStoredUrl ] = usePodcatcherUrl( siteId, podcatcher.id );
	const [ draftUrl, setDraftUrl ] = useState( storedUrl );

	const handleSave = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		setStoredUrl( draftUrl.trim() );
		onClose();
	};

	const serviceArgs = { args: { service: podcatcher.name } };

	return (
		<Modal
			title={ translate( 'Submit to %(service)s', serviceArgs ) as string }
			onRequestClose={ onClose }
			className="podcasting__submit-modal"
		>
			<ol className="podcasting__submit-steps">
				<li className="podcasting__submit-step">
					<h3 className="podcasting__submit-step-title">
						{ translate( 'Step 1: Copy your RSS feed URL' ) }
					</h3>
					<p className="podcasting__submit-step-description">
						{ feedUrl
							? translate(
									'Click the button below to copy your RSS feed URL. %(service)s will require this URL to list your podcast.',
									serviceArgs
							  )
							: translate(
									'Set a podcast category in Feed settings to generate your RSS feed URL.'
							  ) }
					</p>
					{ feedUrl && <ClipboardButtonInput value={ feedUrl } /> }
				</li>

				<li className="podcasting__submit-step">
					<h3 className="podcasting__submit-step-title">
						{ translate( 'Step 2: Submit your podcast to %(service)s', serviceArgs ) }
					</h3>
					<p className="podcasting__submit-step-description">
						{ translate(
							'Click the button below to visit %(service)s and complete their sign up flow.',
							serviceArgs
						) }
						{ podcatcher.learnMoreUrl && (
							<>
								{ ' ' }
								<ExternalLink href={ podcatcher.learnMoreUrl }>
									{ translate( 'Learn more' ) }
								</ExternalLink>
							</>
						) }
					</p>
					<Button
						variant="secondary"
						__next40pxDefaultSize
						icon={ external }
						iconPosition="right"
						href={ podcatcher.submitUrl }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ translate( 'Visit %(service)s', serviceArgs ) }
					</Button>
				</li>

				<li className="podcasting__submit-step">
					<h3 className="podcasting__submit-step-title">
						{ translate( 'Step 3: Enter your %(service)s URL', serviceArgs ) }
					</h3>
					<p className="podcasting__submit-step-description">
						{ translate(
							'Paste your new %(service)s URL into the field below and we’ll use it for your sharing buttons.',
							serviceArgs
						) }
					</p>
					<form className="podcasting__submit-step-form" onSubmit={ handleSave }>
						<input
							type="url"
							className="podcasting__submit-step-input"
							value={ draftUrl }
							onChange={ ( event ) => setDraftUrl( event.target.value ) }
							placeholder="https://"
							aria-label={ translate( '%(service)s URL', serviceArgs ) as string }
						/>
						<Button variant="primary" __next40pxDefaultSize type="submit">
							{ translate( 'Save' ) }
						</Button>
					</form>
				</li>
			</ol>
		</Modal>
	);
};

export default SubmitModal;
