import {
	Button,
	ExternalLink,
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, type FormEvent } from 'react';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useFeedUrl } from '../hooks/use-feed-url';
import { usePodcatcherUrl } from '../hooks/use-podcatcher-url';

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
	const feedUrl = useFeedUrl();
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
			size="medium"
		>
			<VStack as="ol" spacing={ 5 } className="podcast__submit-steps">
				<li className="podcast__submit-step">
					<Text as="h3" weight={ 600 } size="body" className="podcast__submit-step-title">
						{ translate( 'Step 1: Copy your RSS feed URL' ) }
					</Text>
					<Text as="p" variant="muted" className="podcast__submit-step-description">
						{ feedUrl
							? translate(
									'Click the button below to copy your RSS feed URL. %(service)s will require this URL to list your podcast.',
									serviceArgs
							  )
							: translate(
									'Select a podcast category in the Settings tab to generate your RSS feed URL.'
							  ) }
					</Text>
					{ feedUrl && <ClipboardButtonInput value={ feedUrl } /> }
				</li>

				<li className="podcast__submit-step">
					<Text as="h3" weight={ 600 } size="body" className="podcast__submit-step-title">
						{ translate( 'Step 2: Submit your podcast to %(service)s', serviceArgs ) }
					</Text>
					<Text as="p" variant="muted" className="podcast__submit-step-description">
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
				</li>

				<li className="podcast__submit-step">
					<Text as="h3" weight={ 600 } size="body" className="podcast__submit-step-title">
						{ translate( 'Step 3: Enter your %(service)s URL', serviceArgs ) }
					</Text>
					<Text as="p" variant="muted" className="podcast__submit-step-description">
						{ translate(
							'Paste your new %(service)s URL into the field below and we’ll use it for your sharing buttons.',
							serviceArgs
						) }
					</Text>
					<HStack as="form" alignment="stretch" spacing={ 2 } onSubmit={ handleSave }>
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
						<Button variant="primary" __next40pxDefaultSize type="submit">
							{ translate( 'Save' ) }
						</Button>
					</HStack>
				</li>
			</VStack>
		</Modal>
	);
};

export default SubmitModal;
