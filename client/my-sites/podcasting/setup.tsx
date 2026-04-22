import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import {
	LogoApple,
	LogoAmazon,
	LogoPocketCasts,
	LogoPodcastIndex,
	LogoSpotify,
	LogoYouTube,
} from './logos';
import SubmitModal, { type Podcatcher } from './submit-modal';

const PODCATCHERS: Podcatcher[] = [
	{
		id: 'pocketcasts',
		name: 'Pocket Casts',
		submitUrl: 'https://pocketcasts.com/submit',
		learnMoreUrl: 'https://support.pocketcasts.com/knowledge-base/submitting-podcasts/',
		logo: <LogoPocketCasts />,
	},
	{
		id: 'apple',
		name: 'Apple Podcasts',
		submitUrl: 'https://podcastsconnect.apple.com/',
		learnMoreUrl: 'https://podcasters.apple.com/support/897-submit-a-show',
		logo: <LogoApple />,
	},
	{
		id: 'spotify',
		name: 'Spotify',
		submitUrl: 'https://creators.spotify.com/',
		learnMoreUrl:
			'https://support.spotify.com/us/creators/article/claiming-your-podcast-on-spotify-for-creators/',
		logo: <LogoSpotify />,
	},
	{
		id: 'youtube',
		name: 'YouTube',
		submitUrl: 'https://studio.youtube.com',
		learnMoreUrl: 'https://support.google.com/youtube/answer/13973017',
		logo: <LogoYouTube />,
	},
	{
		id: 'amazon',
		name: 'Amazon Music',
		submitUrl: 'https://podcasters.amazon.com',
		logo: <LogoAmazon />,
	},
	{
		id: 'podcastindex',
		name: 'Podcast Index',
		submitUrl: 'https://podcastindex.org/add',
		logo: <LogoPodcastIndex />,
	},
];

const PodcastingSetup = () => {
	const translate = useTranslate();
	const [ activeId, setActiveId ] = useState< string | null >( null );
	const activePodcatcher = PODCATCHERS.find( ( p ) => p.id === activeId ) ?? null;

	return (
		<>
			<header className="podcasting__section-header">
				<h2 className="podcasting__section-heading">{ translate( 'Setup' ) }</h2>
				<p className="podcasting__section-description">
					{ translate(
						'Submit your podcast feed to the major podcatchers so your episodes reach more listeners.'
					) }
				</p>
			</header>
			<div className="podcasting__podcatchers">
				{ PODCATCHERS.map( ( p ) => (
					<Card key={ p.id } className="podcasting__podcatcher-card">
						<div className="podcasting__podcatcher-card-content">
							<div className="podcasting__podcatcher-logo" aria-hidden="true">
								{ p.logo }
							</div>
							<div className="podcasting__podcatcher-info">
								<h3 className="podcasting__podcatcher-name">{ p.name }</h3>
							</div>
							<Button
								variant="secondary"
								__next40pxDefaultSize
								className="podcasting__podcatcher-submit"
								onClick={ () => setActiveId( p.id ) }
							>
								{ translate( 'Submit' ) }
							</Button>
						</div>
					</Card>
				) ) }
			</div>
			{ activePodcatcher && (
				<SubmitModal podcatcher={ activePodcatcher } onClose={ () => setActiveId( null ) } />
			) }
		</>
	);
};

export default PodcastingSetup;
