import './style.scss';

import { FormLabel } from '@automattic/components';
import { Button, Card, CardBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { type ComponentType, useMemo, useState } from 'react';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import {
	LogoAmazon,
	LogoApple,
	LogoPocketCasts,
	LogoPodcastIndex,
	LogoSpotify,
	LogoYouTube,
} from 'calypso/my-sites/podcast/components/logos';

type DirectoryStatus = 'live' | 'pending' | 'not-submitted';

type Directory = {
	id: string;
	name: string;
	submitUrl: string;
	listingUrl?: string;
	status: DirectoryStatus;
	Logo: ComponentType;
};

const DIRECTORIES: Directory[] = [
	{
		id: 'apple',
		name: 'Apple Podcasts',
		submitUrl: 'https://podcastsconnect.apple.com/',
		listingUrl: 'https://podcasts.apple.com/',
		status: 'live',
		Logo: LogoApple,
	},
	{
		id: 'podcastindex',
		name: 'Podcast Index',
		submitUrl: 'https://podcastindex.org/add',
		listingUrl: 'https://podcastindex.org/',
		status: 'live',
		Logo: LogoPodcastIndex,
	},
	{
		id: 'spotify',
		name: 'Spotify',
		submitUrl: 'https://creators.spotify.com/',
		status: 'pending',
		Logo: LogoSpotify,
	},
	{
		id: 'pocketcasts',
		name: 'Pocket Casts',
		submitUrl: 'https://pocketcasts.com/submit',
		status: 'not-submitted',
		Logo: LogoPocketCasts,
	},
	{
		id: 'amazon',
		name: 'Amazon Music',
		submitUrl: 'https://podcasters.amazon.com',
		status: 'not-submitted',
		Logo: LogoAmazon,
	},
	{
		id: 'youtube',
		name: 'YouTube',
		submitUrl: 'https://studio.youtube.com',
		status: 'not-submitted',
		Logo: LogoYouTube,
	},
];

function PodcastingDistribution() {
	const translate = useTranslate();
	const [ feedHealthy, setFeedHealthy ] = useState( true );

	const summary = useMemo( () => {
		const live = DIRECTORIES.filter( ( d ) => d.status === 'live' ).length;
		const pending = DIRECTORIES.filter( ( d ) => d.status === 'pending' ).length;
		const missing = DIRECTORIES.filter( ( d ) => d.status === 'not-submitted' ).length;
		return { live, pending, missing };
	}, [] );

	const statusLabel = ( status: DirectoryStatus ): string => {
		if ( status === 'live' ) {
			return translate( 'Live' ) as string;
		}
		if ( status === 'pending' ) {
			return translate( 'Pending' ) as string;
		}
		return translate( 'Not submitted' ) as string;
	};

	return (
		<Main className="podcasting-v2">
			<div className="podcasting-v2__page-head">
				<div>
					<h2 className="podcasting-v2__page-title">{ translate( 'Distribution' ) }</h2>
					<p className="podcasting-v2__page-lede">
						{ translate(
							'Submit your feed to podcast directories and track where your show is listed.'
						) }
					</p>
				</div>
			</div>

			{ ! feedHealthy && (
				<Notice
					status="is-warning"
					showDismiss={ false }
					className="podcasting-v2__soft-notice"
					text={
						translate(
							'Directories will reject your feed until you add cover art and a contact email. Finish those in Settings first.'
						) as string
					}
				/>
			) }

			<Card className="site-settings__card podcasting-v2__card">
				<CardBody>
					<h3 className="podcasting-v2__card-title">{ translate( 'Podcast directories' ) }</h3>
					<FormSettingExplanation>
						{ translate( '%(live)d live, %(pending)d pending, %(missing)d not submitted.', {
							args: {
								live: summary.live,
								pending: summary.pending,
								missing: summary.missing,
							},
						} ) }
					</FormSettingExplanation>
					<FormFieldset>
						<FormLabel>{ translate( 'RSS feed' ) }</FormLabel>
						<ClipboardButtonInput value="https://lookmaitsapodcast.wordpress.com/category/podcast/feed/" />
						<FormSettingExplanation>
							{ translate(
								'Most directories ask for this URL. Copy it, then open a directory below to submit.'
							) }
						</FormSettingExplanation>
					</FormFieldset>
					<ul className="podcasting-v2__directory-list">
						{ DIRECTORIES.map( ( d ) => {
							const { Logo } = d;
							return (
								<li key={ d.id } className="podcasting-v2__directory-row">
									<div className="podcasting-v2__directory-main">
										<span
											className={ `podcasting-v2__directory-logo is-${ d.status }` }
											aria-hidden="true"
										>
											<Logo />
										</span>
										<div className="podcasting-v2__directory-text">
											<span className="podcasting-v2__directory-name">{ d.name }</span>
											<span className="podcasting-v2__directory-meta">
												<span className={ `podcasting-v2__directory-status is-${ d.status }` }>
													{ statusLabel( d.status ) }
												</span>
											</span>
										</div>
									</div>
									<div className="podcasting-v2__directory-actions">
										{ d.status === 'live' && d.listingUrl && (
											<Button
												size="compact"
												href={ d.listingUrl }
												target="_blank"
												rel="noopener noreferrer"
											>
												{ translate( 'View listing' ) }
											</Button>
										) }
										{ d.status === 'pending' && (
											<Button
												size="compact"
												href={ d.submitUrl }
												target="_blank"
												rel="noopener noreferrer"
											>
												{ translate( 'Check status' ) }
											</Button>
										) }
										{ d.status === 'not-submitted' && (
											<Button
												variant="primary"
												size="compact"
												href={ d.submitUrl }
												target="_blank"
												rel="noopener noreferrer"
											>
												{ translate( 'Submit' ) }
											</Button>
										) }
									</div>
								</li>
							);
						} ) }
					</ul>
					<FormSettingExplanation>
						{ translate( 'Most directories take a few days to appear after you submit.' ) }
					</FormSettingExplanation>
				</CardBody>
			</Card>

			<Notice
				status="is-info"
				showDismiss={ false }
				className="podcasting-v2__soft-notice"
				text={ translate( 'Prototype only. Statuses are illustrative.' ) as string }
			/>

			<p className="podcasting-v2__prototype-toggle">
				<button
					type="button"
					className="podcasting-v2__inline-link"
					onClick={ () => setFeedHealthy( ( v ) => ! v ) }
				>
					{ feedHealthy
						? translate( 'Prototype: simulate unhealthy feed' )
						: translate( 'Prototype: simulate healthy feed' ) }
				</button>
			</p>
		</Main>
	);
}

export default PodcastingDistribution;
