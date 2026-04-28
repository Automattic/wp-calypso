import {
	Button,
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
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
import type { ComponentType } from 'react';

type Directory = {
	id: string;
	name: string;
	submitUrl: string;
	Logo: ComponentType;
};

const DIRECTORIES: Directory[] = [
	{
		id: 'pocketcasts',
		name: 'Pocket Casts',
		submitUrl: 'https://pocketcasts.com/submit',
		Logo: LogoPocketCasts,
	},
	{
		id: 'apple',
		name: 'Apple Podcasts',
		submitUrl: 'https://podcastsconnect.apple.com/',
		Logo: LogoApple,
	},
	{
		id: 'spotify',
		name: 'Spotify',
		submitUrl: 'https://creators.spotify.com/',
		Logo: LogoSpotify,
	},
	{
		id: 'youtube',
		name: 'YouTube',
		submitUrl: 'https://studio.youtube.com',
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

	return (
		<>
			<header className="podcast__section-header">
				<h2 className="podcast__section-heading">{ translate( 'Distribution' ) }</h2>
				<p className="podcast__section-description">
					{ translate(
						'Submit your feed to podcast directories and track where your show is listed.'
					) }
				</p>
			</header>

			<Card className="site-settings__card podcast__card">
				<CardBody>
					<VStack spacing={ 8 }>
						<VStack spacing={ 4 }>
							<VStack spacing={ 1 }>
								<h3 className="podcast__card-title">{ translate( 'RSS feed' ) }</h3>
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
								<h3 className="podcast__card-title">{ translate( 'Podcast directories' ) }</h3>
								<Text variant="muted">
									{ translate(
										'Submit your podcast to the directories below where you want it to appear. Most take a few days to go live.'
									) }
								</Text>
							</VStack>
							<VStack as="ul" spacing={ 0 } className="podcast__directory-list">
								{ DIRECTORIES.map( ( { id, name, submitUrl, Logo } ) => (
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
										<Button
											variant="primary"
											size="compact"
											href={ submitUrl }
											target="_blank"
											rel="noopener noreferrer"
										>
											{ translate( 'Submit' ) }
										</Button>
									</HStack>
								) ) }
							</VStack>
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}

export default Distribution;
