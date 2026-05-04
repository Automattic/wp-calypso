import { ConfettiAnimation } from '@automattic/components';
import {
	Button,
	Card,
	CardBody,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { useFeedUrl } from '../hooks/use-feed-url';
import {
	LogoAmazon,
	LogoApple,
	LogoPocketCasts,
	LogoPodcastIndex,
	LogoSpotify,
	LogoYouTube,
} from './logos';
import SubmitModal from './submit-modal';
import type { ComponentType } from 'react';

type Directory = {
	id: string;
	name: string;
	submitUrl: string;
	learnMoreUrl?: string;
	Logo: ComponentType;
};

const DIRECTORIES: Directory[] = [
	{
		id: 'pocketcasts',
		name: 'Pocket Casts',
		submitUrl: 'https://pocketcasts.com/submit',
		learnMoreUrl: 'https://support.pocketcasts.com/knowledge-base/submitting-podcasts/',
		Logo: LogoPocketCasts,
	},
	{
		id: 'apple',
		name: 'Apple Podcasts',
		submitUrl: 'https://podcastsconnect.apple.com/',
		learnMoreUrl: 'https://podcasters.apple.com/support/897-submit-a-show',
		Logo: LogoApple,
	},
	{
		id: 'spotify',
		name: 'Spotify',
		submitUrl: 'https://creators.spotify.com/',
		learnMoreUrl:
			'https://support.spotify.com/creators/article/claiming-your-podcast-on-spotify-for-creators/',
		Logo: LogoSpotify,
	},
	{
		id: 'youtube',
		name: 'YouTube',
		submitUrl: 'https://studio.youtube.com',
		learnMoreUrl: 'https://support.google.com/youtube/answer/13973017',
		Logo: LogoYouTube,
	},
	{
		id: 'amazon',
		name: 'Amazon Music',
		submitUrl: 'https://podcasters.amazon.com',
		Logo: LogoAmazon,
	},
	{
		id: 'podcastindex',
		name: 'Podcast Index',
		submitUrl: 'https://podcastindex.org/add',
		Logo: LogoPodcastIndex,
	},
];

function Distribution() {
	const translate = useTranslate();
	const feedUrl = useFeedUrl();
	const [ activeId, setActiveId ] = useState< string | null >( null );
	const [ showConfetti, setShowConfetti ] = useState( false );
	const activeDirectory = DIRECTORIES.find( ( d ) => d.id === activeId ) ?? null;
	const prefersReducedMotion =
		typeof window !== 'undefined' &&
		window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	return (
		<>
			<Card className="site-settings__card podcast__card podcast__distribution">
				<CardBody>
					<VStack spacing={ 8 }>
						<VStack spacing={ 4 }>
							<VStack spacing={ 1 }>
								<Heading level={ 3 }>{ translate( 'RSS feed' ) }</Heading>
								<Text variant="muted">
									{ translate(
										'Copy this URL, then submit it to each directory below to publish your podcast.'
									) }
								</Text>
							</VStack>
							{ feedUrl ? (
								<ClipboardButtonInput value={ feedUrl } />
							) : (
								<FormSettingExplanation>
									{ translate(
										'Set your podcast category to generate the feed URL you can submit to directories.'
									) }
								</FormSettingExplanation>
							) }
						</VStack>
						<VStack spacing={ 4 }>
							<VStack spacing={ 1 }>
								<Heading level={ 3 }>{ translate( 'Podcast directories' ) }</Heading>
								<Text variant="muted">
									{ translate(
										'Submit your podcast to the directories below where you want it to appear. Most take a few days to go live.'
									) }
								</Text>
							</VStack>
							<VStack as="ul" spacing={ 0 } className="podcast__directory-list">
								{ DIRECTORIES.map( ( { id, name, Logo } ) => (
									<HStack
										as="li"
										key={ id }
										alignment="center"
										justify="space-between"
										className="podcast__directory-row"
									>
										<HStack
											alignment="center"
											justify="flex-start"
											spacing={ 4 }
											expanded={ false }
										>
											<span aria-hidden="true">
												<Logo />
											</span>
											<Text weight={ 500 }>{ name }</Text>
										</HStack>
										<Button variant="primary" size="compact" onClick={ () => setActiveId( id ) }>
											{ translate( 'Submit' ) }
										</Button>
									</HStack>
								) ) }
							</VStack>
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			{ activeDirectory && (
				<SubmitModal
					feedUrl={ feedUrl }
					podcatcher={ {
						id: activeDirectory.id,
						name: activeDirectory.name,
						submitUrl: activeDirectory.submitUrl,
						learnMoreUrl: activeDirectory.learnMoreUrl,
					} }
					onClose={ () => setActiveId( null ) }
					onFirstSave={ () => setShowConfetti( true ) }
				/>
			) }

			{ showConfetti && <ConfettiAnimation trigger={ ! prefersReducedMotion } delay={ 300 } /> }
		</>
	);
}

export default Distribution;
