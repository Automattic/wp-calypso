import { Badge } from '@automattic/ui';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SVG, Path } from '@wordpress/primitives';
import { useState } from 'react';
import { useAnalytics } from '../app/analytics';
import { Text } from '../components/text';

export type DiscoverAudience = 'creators' | 'developers';

export interface VideoTutorial {
	id: string;
	title: string;
}

export interface NewsItem {
	title: string;
	description: string;
	isNew?: boolean;
}

export interface CommunityContent {
	title: string;
	description: string;
	cta: { label: string; href: string };
	variant?: 'blaze';
}

export interface HelpLink {
	label: string;
	href: string;
}

export function useDiscoverTracks( audience: DiscoverAudience ) {
	const { recordTracksEvent } = useAnalytics();
	return ( item: string ) =>
		recordTracksEvent( 'calypso_dashboard_discover_click', { audience, item } );
}

export function SectionTitle( { title, action }: { title: string; action?: React.ReactNode } ) {
	return (
		<HStack justify="space-between" alignment="baseline">
			<Heading level={ 2 } className="discover-section-title">
				{ title }
			</Heading>
			{ action }
		</HStack>
	);
}

// Blaze flame from the shared BlazeLogo ( packages/components/src/icons/blaze.tsx ),
// filled with the blaze-ads.com brand gradient.
const blazeFlameIcon = (
	<SVG viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient id="discover-blaze-flame-gradient" x1="0" y1="1" x2="1" y2="0">
				<stop offset="0" stopColor="#f43e37" />
				<stop offset="1" stopColor="#ff6c3d" />
			</linearGradient>
		</defs>
		<Path
			fill="url(#discover-blaze-flame-gradient)"
			d="M112 71.186C112 77.0744 110.748 82.8791 108.302 88.3209C105.856 93.7628 102.3 98.7023 97.7771 102.86C93.2827 107.019 87.9349 110.312 82.0466 112.572C79.2589 113.633 76.3859 114.442 73.456 115L74.7645 114.302C74.7645 114.302 86.0859 107.828 88.3331 93.3163C89.3856 80.3674 78.6331 74.7023 78.6331 74.7023C78.6331 74.7023 73.1716 81.6184 65.4059 81.6184C53.2026 81.6184 55.4167 61.3158 55.4167 61.3158C55.4167 61.3158 36.9032 70.8512 36.9032 91.614C36.9032 104.591 49.9883 114.163 49.9883 114.163V114.191C48.2815 113.744 46.6032 113.186 44.9534 112.544C39.0651 110.284 33.7173 106.991 29.2229 102.833C24.7284 98.6744 21.1443 93.7349 18.6979 88.293C16.2516 82.8512 15 77.0465 15 71.1581C15 51.2326 38.2686 31.9209 38.2686 31.9209C38.2686 31.9209 40.4874 47.0744 51.8372 47.0744C73.1716 47.0744 65.4059 13 65.4059 13C65.4059 13 84.8059 24.3581 90.6372 54.6372C101.222 53.2632 100.337 39.4837 100.337 39.4837C100.337 39.4837 112 54.6372 112 71.3256"
		/>
	</SVG>
);

const playIcon = (
	<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<Path d="M8 5.5v13l11-6.5z" />
	</SVG>
);

export function VideoTutorials( {
	videos,
	audience,
	title,
}: {
	videos: VideoTutorial[];
	audience: DiscoverAudience;
	title?: string;
} ) {
	const trackClick = useDiscoverTracks( audience );
	const [ selected, setSelected ] = useState( videos[ 0 ] );
	const [ isPlaying, setIsPlaying ] = useState( false );

	return (
		<VStack spacing={ 4 }>
			<SectionTitle
				title={ title ?? __( 'Watch video tutorials' ) }
				action={
					<Button
						variant="link"
						href="https://www.youtube.com/@wordpressdotcom"
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => trackClick( 'videos_view_all' ) }
					>
						{ __( 'View all tutorials' ) }
					</Button>
				}
			/>
			<div className="discover-videos">
				<div className="discover-videos-player">
					{ isPlaying ? (
						<iframe
							src={ `https://www.youtube-nocookie.com/embed/${ selected.id }?autoplay=1&rel=0` }
							title={ selected.title }
							allow="autoplay; encrypted-media; picture-in-picture"
							allowFullScreen
						/>
					) : (
						<button
							type="button"
							className="discover-videos-poster"
							aria-label={ __( 'Play video' ) }
							onClick={ () => {
								setIsPlaying( true );
								trackClick( `video_${ selected.id }` );
							} }
						>
							<img
								src={ `https://i.ytimg.com/vi/${ selected.id }/maxresdefault.jpg` }
								alt={ selected.title }
							/>
							<span className="discover-videos-poster-play">
								<Icon icon={ playIcon } size={ 32 } />
							</span>
						</button>
					) }
				</div>
				<ul className="discover-videos-list">
					{ videos.map( ( video ) => {
						const isActive = video.id === selected.id;
						return (
							<li key={ video.id }>
								<button
									type="button"
									className="discover-videos-item"
									aria-current={ isActive ? 'true' : undefined }
									onClick={ () => {
										setSelected( video );
										setIsPlaying( true );
										trackClick( `video_${ video.id }` );
									} }
								>
									<img
										src={ `https://i.ytimg.com/vi/${ video.id }/mqdefault.jpg` }
										alt=""
										loading="lazy"
									/>
									<span className="discover-videos-item-text">
										<span className="discover-videos-item-title">{ video.title }</span>
										<span className="discover-videos-item-play">
											<Icon icon={ playIcon } size={ 16 } />
											{ isActive && isPlaying ? __( 'Now playing' ) : __( 'Play video' ) }
										</span>
									</span>
								</button>
							</li>
						);
					} ) }
				</ul>
			</div>
		</VStack>
	);
}

export function NewsAndCommunity( {
	news,
	community,
	viewAllHref,
	audience,
}: {
	news: NewsItem[];
	community: CommunityContent;
	viewAllHref: string;
	audience: DiscoverAudience;
} ) {
	const trackClick = useDiscoverTracks( audience );

	return (
		<VStack spacing={ 4 }>
			<SectionTitle
				title={ __( 'Follow what’s new' ) }
				action={
					<Button
						variant="link"
						href={ viewAllHref }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => trackClick( 'news_view_all' ) }
					>
						{ __( 'View all updates' ) }
					</Button>
				}
			/>
			<div className="discover-news-layout">
				<div className="discover-news">
					{ news.map( ( item ) => (
						<div
							key={ item.title }
							className={ `discover-news-item ${ item.isNew ? 'is-new' : '' }` }
						>
							<HStack justify="flex-start" spacing={ 2 } alignment="center" expanded={ false }>
								<Text weight={ 500 }>{ item.title }</Text>
								{ item.isNew && <Badge intent="success">{ __( 'New' ) }</Badge> }
							</HStack>
							<Text as="p" className="discover-news-item-description">
								{ item.description }
							</Text>
						</div>
					) ) }
				</div>
				<div
					className={ `discover-community ${
						community.variant ? `is-${ community.variant }` : ''
					}` }
				>
					{ community.variant === 'blaze' && (
						<span className="discover-community-icon">
							<Icon icon={ blazeFlameIcon } size={ 44 } />
						</span>
					) }
					<Heading level={ 3 } className="discover-community-title">
						{ community.title }
					</Heading>
					<Text as="p" className="discover-community-description">
						{ community.description }
					</Text>
					<div>
						<Button
							variant="secondary"
							className="discover-community-cta"
							href={ community.cta.href }
							target="_blank"
							rel="noopener noreferrer"
							__next40pxDefaultSize
							onClick={ () => trackClick( 'community_cta' ) }
						>
							{ community.cta.label }
						</Button>
					</div>
				</div>
			</div>
		</VStack>
	);
}

export function HelpStrip( {
	links,
	audience,
}: {
	links: HelpLink[];
	audience: DiscoverAudience;
} ) {
	const trackClick = useDiscoverTracks( audience );

	return (
		<VStack spacing={ 3 } alignment="center" className="discover-help">
			<Text weight={ 500 }>
				{ __( 'We’re here to make your experience as smooth as possible' ) }
			</Text>
			<HStack spacing={ 4 } justify="center" expanded={ false } wrap>
				{ links.map( ( link ) => (
					<Button
						key={ link.label }
						variant="link"
						href={ link.href }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => trackClick( `help_${ link.label }` ) }
					>
						{ link.label }
					</Button>
				) ) }
			</HStack>
		</VStack>
	);
}
