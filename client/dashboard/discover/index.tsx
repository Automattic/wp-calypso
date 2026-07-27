import { localizeUrl } from '@automattic/i18n-utils';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import {
	arrowUp,
	chartBar,
	currencyDollar,
	desktop,
	envelope,
	megaphone,
	people,
} from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHelpCenter } from '../app/help-center';
import { useWorkspace } from '../app/workspace';
import PageLayout from '../components/page-layout';
import { Text } from '../components/text';
import { wpcomLink } from '../utils/link';
import DeveloperDiscover from './developer';
import {
	HelpStrip,
	NewsAndCommunity,
	SectionTitle,
	useDiscoverTracks,
	VideoTutorials,
} from './shared';
import type {
	CommunityContent,
	DiscoverAudience,
	HelpLink,
	NewsItem,
	VideoTutorial,
} from './shared';

import './style.scss';

interface HeroContent {
	eyebrow: string;
	title: string;
	subtitle: string;
	primaryCta: { label: string; href: string };
	secondaryCta: { label: string; href: string };
	footnote: string;
}

interface ShowcaseTheme {
	slug: string;
	name: string;
}

interface Blueprint {
	slug: string;
	name: string;
	// Pub theme whose screenshot illustrates the blueprint.
	theme: string;
}

type ShowcaseVersion = 'themes' | 'blueprints';

const SHOWCASE_VERSIONS: ShowcaseVersion[] = [ 'themes', 'blueprints' ];

const SHOWCASE_VERSION_STORAGE_KEY = 'discover-showcase-version';

interface Panel {
	icon: React.JSX.Element;
	title: string;
	description: string;
	cta: { label: string; href: string };
	wide?: boolean;
	terminal?: string[];
}

type CreatorHeroVersion = 'help' | 'ai' | 'original';

const CREATOR_HERO_VERSIONS: CreatorHeroVersion[] = [ 'help', 'ai', 'original' ];

const HERO_VERSION_STORAGE_KEY = 'discover-hero-version';

const getCreatorHero = (): HeroContent => ( {
	eyebrow: __( 'Made for creators' ),
	title: __( 'Create something worth reading' ),
	subtitle: __(
		'Ideas, tools, and inspiration to take your site further — gathered in one place, updated all the time.'
	),
	primaryCta: { label: __( 'Write a post' ), href: wpcomLink( '/post' ) },
	secondaryCta: { label: __( 'Build with AI' ), href: 'https://wordpress.com/ai-website-builder/' },
	footnote: __(
		'Millions of creators publish on WordPress.com every day. You’re in good company.'
	),
} );

const getHelpHeroChips = (): string[] => [
	__( 'Connect a domain' ),
	__( 'Upgrade my plan' ),
	__( 'Grow my traffic' ),
	__( 'Reset my password' ),
];

// Rotating placeholder suggestions for the ask field. Creator-focused and
// deliberately distinct from the chips rendered below it.
const getHelpHeroPrompts = (): string[] => [
	__( 'How do I get my first 100 subscribers?' ),
	__( 'Help me write a better About page' ),
	__( 'How can I earn money from my blog?' ),
	__( 'How do I start a paid newsletter?' ),
	__( 'Why isn’t my site showing on Google?' ),
	__( 'What should I blog about this week?' ),
];

const getAiHeroChips = (): string[] => [
	__( 'Start a travel blog' ),
	__( 'Create a restaurant website' ),
	__( 'Launch a coaching site' ),
	__( 'Design a coffee shop site' ),
];

const CREATOR_THEMES: ShowcaseTheme[] = [
	{ slug: 'bibliophile', name: 'Bibliophile' },
	{ slug: 'lettre', name: 'Lettre' },
	{ slug: 'dorna', name: 'Dorna' },
	{ slug: 'stewart', name: 'Stewart' },
	{ slug: 'course', name: 'Course' },
	{ slug: 'skatepark', name: 'Skatepark' },
];

// Curated from youtube.com/@wordpressdotcom. Titles are the actual YouTube
// video titles, so they stay untranslated.
const CREATOR_VIDEOS: VideoTutorial[] = [
	{ id: 'wm0jPV234zc', title: 'The New WordPress Editor Built for Writing' },
	{ id: '9rCal5dxMiM', title: 'How to turn a rough draft into a finished blog post with AI' },
	{ id: 'px-AH-ZoKmU', title: 'Turn Your Newsletter into a Paid Subscription on WordPress.com' },
	{ id: '-rVv1bDHlRQ', title: 'How to Earn Ad Revenue with WordAds on WordPress.com' },
	{ id: 'wHz4uiaBbOE', title: 'How to connect an existing domain to WordPress.com' },
];

const getCreatorBlueprints = (): Blueprint[] => [
	{
		slug: 'newsletter',
		name: __( 'Newsletter' ),
		theme: 'lettre',
	},
	{
		slug: 'personal-blog',
		name: __( 'Personal blog' ),
		theme: 'stewart',
	},
	{
		slug: 'portfolio',
		name: __( 'Portfolio' ),
		theme: 'dorna',
	},
	{
		slug: 'author-site',
		name: __( 'Author site' ),
		theme: 'bibliophile',
	},
	{
		slug: 'online-course',
		name: __( 'Online course' ),
		theme: 'course',
	},
	{
		slug: 'community-hub',
		name: __( 'Community hub' ),
		theme: 'skatepark',
	},
];

const getCreatorPanels = (): Panel[] => [
	{
		icon: megaphone,
		title: __( 'Promote with Blaze' ),
		description: __(
			'Turn your best post into an ad that runs across millions of WordPress and Tumblr sites. No agency required.'
		),
		cta: { label: __( 'Start a campaign' ), href: wpcomLink( '/advertising' ) },
	},
	{
		icon: envelope,
		title: __( 'Send it as a newsletter' ),
		description: __( 'Every post can land in your readers’ inboxes automatically.' ),
		cta: { label: __( 'Set up newsletter' ), href: wpcomLink( '/setup/newsletter' ) },
	},
	{
		icon: currencyDollar,
		title: __( 'Get paid for your work' ),
		description: __( 'Paid subscriptions, tips, and donations — built in, no plugins needed.' ),
		cta: { label: __( 'Explore Earn' ), href: wpcomLink( '/earn' ) },
	},
	{
		icon: desktop,
		title: __( 'Meet your readers where they are' ),
		description: __(
			'Auto-share new posts to your social accounts and track what lands from your stats.'
		),
		cta: { label: __( 'Connect social accounts' ), href: wpcomLink( '/marketing/connections' ) },
	},
	{
		icon: chartBar,
		title: __( 'Know what’s working' ),
		description: __(
			'See which posts bring readers back, where they come from, and what to write next.'
		),
		cta: { label: __( 'Open Stats' ), href: wpcomLink( '/stats' ) },
	},
	{
		icon: people,
		title: __( 'Get discovered in the Reader' ),
		description: __(
			'Millions of people browse the WordPress.com Reader every day. Tag your posts and they can find you.'
		),
		cta: { label: __( 'Open the Reader' ), href: wpcomLink( '/reader' ) },
	},
];

const getCreatorNews = (): NewsItem[] => [
	{
		title: __( 'The AI website builder now designs your whole site from one chat' ),
		description: __( 'Describe what you want and watch pages, copy, and images come together.' ),
		isNew: true,
	},
	{
		title: __( 'New theme drop: six fresh looks for writers' ),
		description: __( 'Editorial layouts with big type, built for long reads.' ),
	},
	{
		title: __( 'Newsletter stats now show which subjects get opened' ),
		description: __( 'Learn what makes your readers click, straight from your stats page.' ),
	},
];

const getCreatorCommunity = (): CommunityContent => ( {
	variant: 'blaze',
	title: __( 'Share your site with the world' ),
	description: __(
		'Reach new readers and subscribers in minutes. Blaze puts your posts in front of millions across WordPress and Tumblr — set a budget, pick your audience, and watch it spread.'
	),
	cta: { label: __( 'Start advertising' ), href: wpcomLink( '/advertising' ) },
} );

const getCreatorHelpLinks = (): HelpLink[] => [
	{ label: __( 'WordPress.com Learn' ), href: 'https://wordpress.com/learn/' },
	{ label: __( 'Support guides' ), href: localizeUrl( 'https://wordpress.com/support/' ) },
	{ label: __( 'Contact us' ), href: wpcomLink( '/help' ) },
];

function Hero( { content, audience }: { content: HeroContent; audience: DiscoverAudience } ) {
	const trackClick = useDiscoverTracks( audience );

	return (
		<section className="discover-hero">
			<VStack spacing={ 5 } alignment="center" className="discover-hero-inner">
				<Text className="discover-hero-eyebrow" as="p">
					{ content.eyebrow }
				</Text>
				<Heading level={ 1 } className="discover-hero-title">
					{ content.title }
				</Heading>
				<Text className="discover-hero-subtitle" as="p">
					{ content.subtitle }
				</Text>
				<HStack spacing={ 3 } justify="center" expanded={ false } wrap>
					<Button
						variant="primary"
						href={ content.primaryCta.href }
						__next40pxDefaultSize
						onClick={ () => trackClick( 'hero_primary' ) }
					>
						{ content.primaryCta.label }
					</Button>
					<Button
						variant="secondary"
						className="discover-hero-secondary-cta"
						href={ content.secondaryCta.href }
						target="_blank"
						rel="noopener noreferrer"
						__next40pxDefaultSize
						onClick={ () => trackClick( 'hero_secondary' ) }
					>
						{ content.secondaryCta.label }
					</Button>
				</HStack>
				<Text className="discover-hero-footnote" as="p">
					{ content.footnote }
				</Text>
			</VStack>
		</section>
	);
}

// Types each phrase into `display` character by character, holds it, erases
// it, then moves on to the next — a "someone is typing" placeholder effect.
function useTypingPlaceholder( phrases: string[], enabled: boolean ): string {
	const [ display, setDisplay ] = useState( '' );

	useEffect( () => {
		if ( ! enabled || phrases.length === 0 ) {
			return;
		}

		let phraseIndex = 0;
		let length = 0;
		// The caret stays solid while typing/erasing and blinks during pauses,
		// mirroring how a real text caret behaves.
		let phase: 'typing' | 'holding' | 'erasing' | 'resting' = 'typing';
		let caretOn = true;
		let blinksLeft = 0;
		let timer: ReturnType< typeof setTimeout >;

		const render = () => {
			setDisplay( phrases[ phraseIndex ].slice( 0, length ) + ( caretOn ? '|' : '' ) );
		};

		const tick = () => {
			const phrase = phrases[ phraseIndex ];
			let delay;
			if ( phase === 'typing' ) {
				length++;
				caretOn = true;
				delay = 70;
				if ( length === phrase.length ) {
					phase = 'holding';
					blinksLeft = 5;
				}
			} else if ( phase === 'holding' ) {
				caretOn = ! caretOn;
				blinksLeft--;
				delay = 450;
				if ( blinksLeft === 0 ) {
					phase = 'erasing';
					caretOn = true;
				}
			} else if ( phase === 'erasing' ) {
				length--;
				caretOn = true;
				delay = 30;
				if ( length === 0 ) {
					phase = 'resting';
					blinksLeft = 2;
				}
			} else {
				caretOn = ! caretOn;
				blinksLeft--;
				delay = 400;
				if ( blinksLeft === 0 ) {
					phase = 'typing';
					phraseIndex = ( phraseIndex + 1 ) % phrases.length;
				}
			}
			render();
			timer = setTimeout( tick, delay );
		};

		render();
		timer = setTimeout( tick, 600 );
		return () => clearTimeout( timer );
	}, [ phrases, enabled ] );

	return display;
}

function HelpHero( { audience }: { audience: DiscoverAudience } ) {
	const trackClick = useDiscoverTracks( audience );
	const { setOpenOdieWithContext } = useHelpCenter();
	const [ question, setQuestion ] = useState( '' );
	const [ isFocused, setIsFocused ] = useState( false );
	const prefersReducedMotion = useReducedMotion();
	const prompts = useMemo( getHelpHeroPrompts, [] );
	const isAnimating = ! isFocused && question === '' && ! prefersReducedMotion;
	const animatedPlaceholder = useTypingPlaceholder( prompts, isAnimating );

	const ask = ( message: string, item: string ) => {
		if ( ! message.trim() ) {
			return;
		}
		trackClick( item );
		setOpenOdieWithContext( { initialMessage: message.trim(), section: 'discover' } );
	};

	return (
		<VStack spacing={ 5 } alignment="center" className="discover-hero-inner">
			<Text className="discover-hero-eyebrow" as="p">
				{ __( 'Made for creators' ) }
			</Text>
			<Heading level={ 1 } className="discover-hero-title">
				{ __( 'Ask us anything' ) }
			</Heading>
			<form
				className="discover-hero-ask"
				onSubmit={ ( event ) => {
					event.preventDefault();
					ask( question, 'hero_help_ask' );
				} }
			>
				<input
					type="text"
					value={ question }
					aria-label={ __( 'How can we help you?' ) }
					placeholder={ isAnimating ? animatedPlaceholder : __( 'How can we help you?' ) }
					onChange={ ( event ) => setQuestion( event.target.value ) }
					onFocus={ () => setIsFocused( true ) }
					onBlur={ () => setIsFocused( false ) }
				/>
				<button type="submit" aria-label={ __( 'Ask' ) }>
					<Icon icon={ arrowUp } size={ 20 } />
				</button>
			</form>
			<HStack spacing={ 2 } justify="center" expanded={ false } wrap>
				{ getHelpHeroChips().map( ( chip ) => (
					<button
						key={ chip }
						type="button"
						className="discover-hero-chip"
						onClick={ () => ask( chip, 'hero_help_chip' ) }
					>
						{ chip }
					</button>
				) ) }
			</HStack>
		</VStack>
	);
}

function AiHero( { audience }: { audience: DiscoverAudience } ) {
	const trackClick = useDiscoverTracks( audience );
	const [ prompt, setPrompt ] = useState( '' );
	const textareaRef = useRef< HTMLTextAreaElement >( null );

	const submit = () => {
		if ( ! prompt.trim() ) {
			return;
		}
		trackClick( 'hero_ai_submit' );
		window.location.href = addQueryArgs( wpcomLink( '/setup/ai-site-builder' ), {
			prompt: prompt.trim(),
			source: 'discover-hero',
		} );
	};

	return (
		<VStack spacing={ 5 } alignment="center" className="discover-hero-inner">
			<Text className="discover-hero-eyebrow" as="p">
				{ __( 'AI Website Builder' ) }
			</Text>
			<Heading level={ 1 } className="discover-hero-title">
				{ __( 'Make a website as unique as you.' ) }
			</Heading>
			<div className="discover-hero-prompt">
				<textarea
					ref={ textareaRef }
					value={ prompt }
					rows={ 3 }
					placeholder={ __( 'Describe the site you want to create…' ) }
					onChange={ ( event ) => setPrompt( event.target.value ) }
					onKeyDown={ ( event ) => {
						if ( event.key === 'Enter' && ! event.shiftKey ) {
							event.preventDefault();
							submit();
						}
					} }
				/>
				<button type="button" aria-label={ __( 'Create my site' ) } onClick={ submit }>
					<Icon icon={ arrowUp } size={ 20 } />
				</button>
			</div>
			<HStack spacing={ 2 } justify="center" expanded={ false } wrap>
				{ getAiHeroChips().map( ( chip ) => (
					<button
						key={ chip }
						type="button"
						className="discover-hero-chip"
						onClick={ () => {
							setPrompt( chip );
							textareaRef.current?.focus();
						} }
					>
						{ chip }
					</button>
				) ) }
			</HStack>
			<Text className="discover-hero-footnote" as="p">
				{ __( 'Start for free. No credit card required.' ) }
			</Text>
		</VStack>
	);
}

function CreatorHero( { audience }: { audience: DiscoverAudience } ) {
	const [ version, setVersion ] = useState< CreatorHeroVersion >( () => {
		if ( typeof window === 'undefined' ) {
			return 'help';
		}
		const stored = window.localStorage.getItem( HERO_VERSION_STORAGE_KEY ) as CreatorHeroVersion;
		return CREATOR_HERO_VERSIONS.includes( stored ) ? stored : 'help';
	} );

	const switchVersion = ( next: CreatorHeroVersion ) => {
		setVersion( next );
		window.localStorage.setItem( HERO_VERSION_STORAGE_KEY, next );
	};

	return (
		<div className="discover-hero-wrap">
			{ version === 'original' ? (
				<Hero content={ getCreatorHero() } audience={ audience } />
			) : (
				<section className="discover-hero">
					{ version === 'help' ? (
						<HelpHero audience={ audience } />
					) : (
						<AiHero audience={ audience } />
					) }
				</section>
			) }
			<div className="discover-hero-switcher">
				{ CREATOR_HERO_VERSIONS.map( ( value, index ) => (
					<button
						key={ value }
						type="button"
						aria-pressed={ version === value }
						onClick={ () => switchVersion( value ) }
					>
						{ `V${ index + 1 }` }
					</button>
				) ) }
			</div>
		</div>
	);
}

function ThemeShowcase( { audience }: { audience: DiscoverAudience } ) {
	const trackClick = useDiscoverTracks( audience );

	return (
		<VStack spacing={ 4 }>
			<SectionTitle
				title={ __( 'Set your site apart' ) }
				action={
					<Button
						variant="link"
						href={ wpcomLink( '/themes' ) }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => trackClick( 'themes_view_all' ) }
					>
						{ __( 'Explore all themes' ) }
					</Button>
				}
			/>
			<div className="discover-rail">
				{ CREATOR_THEMES.map( ( theme ) => (
					<a
						key={ theme.slug }
						className="discover-rail-card"
						href={ wpcomLink( `/theme/${ theme.slug }` ) }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => trackClick( `theme_${ theme.slug }` ) }
					>
						<img
							src={ `https://s0.wp.com/wp-content/themes/pub/${ theme.slug }/screenshot.png` }
							alt={ theme.name }
							loading="lazy"
						/>
						<span className="discover-rail-card-label">{ theme.name }</span>
					</a>
				) ) }
			</div>
		</VStack>
	);
}

function BlueprintShowcase( { audience }: { audience: DiscoverAudience } ) {
	const trackClick = useDiscoverTracks( audience );

	return (
		<VStack spacing={ 4 }>
			<SectionTitle
				title={ __( 'Start with a blueprint' ) }
				action={
					<Button
						variant="link"
						href="https://wordpress.com/blueprints/"
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => trackClick( 'blueprints_view_all' ) }
					>
						{ __( 'Explore all blueprints' ) }
					</Button>
				}
			/>
			<Text as="p" className="discover-section-subheading">
				{ __(
					'A blueprint is a theme plus the plugins, pages, and settings for what you’re building. Start from a site that’s already set up, and WordPress.com AI helps you finish the rest.'
				) }
			</Text>
			<div className="discover-rail">
				{ getCreatorBlueprints().map( ( blueprint ) => (
					<a
						key={ blueprint.slug }
						className="discover-rail-card"
						href={ wpcomLink( `/setup/blueprint/${ blueprint.slug }` ) }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => trackClick( `blueprint_${ blueprint.slug }` ) }
					>
						<img
							src={ `https://s0.wp.com/wp-content/themes/pub/${ blueprint.theme }/screenshot.png` }
							alt={ blueprint.name }
							loading="lazy"
						/>
						<span className="discover-rail-card-label">{ blueprint.name }</span>
					</a>
				) ) }
			</div>
		</VStack>
	);
}

function PanelGrid( {
	title,
	panels,
	audience,
}: {
	title: string;
	panels: Panel[];
	audience: DiscoverAudience;
} ) {
	const trackClick = useDiscoverTracks( audience );

	return (
		<VStack spacing={ 4 }>
			<SectionTitle title={ title } />
			<div className="discover-bento">
				{ panels.map( ( panel ) => (
					<div key={ panel.title } className={ `discover-panel ${ panel.wide ? 'is-wide' : '' }` }>
						<span className="discover-panel-icon">
							<Icon icon={ panel.icon } />
						</span>
						<Heading level={ 3 } className="discover-panel-title">
							{ panel.title }
						</Heading>
						<Text as="p" className="discover-panel-description">
							{ panel.description }
						</Text>
						{ panel.terminal && (
							<code className="discover-terminal">
								{ panel.terminal.map( ( line ) => (
									<span key={ line }>{ line }</span>
								) ) }
							</code>
						) }
						<div className="discover-panel-action">
							<Button
								variant="link"
								href={ panel.cta.href }
								onClick={ () => trackClick( `panel_${ panel.title }` ) }
							>
								{ panel.cta.label }
							</Button>
						</div>
					</div>
				) ) }
			</div>
		</VStack>
	);
}

export default function Discover() {
	const workspace = useWorkspace();
	const isCreators = workspace === 'essential';
	const audience: DiscoverAudience = isCreators ? 'creators' : 'developers';
	const trackClick = useDiscoverTracks( audience );
	const [ showcaseVersion, setShowcaseVersion ] = useState< ShowcaseVersion >( () => {
		if ( typeof window === 'undefined' ) {
			return 'themes';
		}
		const stored = window.localStorage.getItem( SHOWCASE_VERSION_STORAGE_KEY ) as ShowcaseVersion;
		return SHOWCASE_VERSIONS.includes( stored ) ? stored : 'themes';
	} );

	const switchShowcaseVersion = ( next: ShowcaseVersion ) => {
		setShowcaseVersion( next );
		window.localStorage.setItem( SHOWCASE_VERSION_STORAGE_KEY, next );
		trackClick( `showcase_version_${ next }` );
	};

	return (
		<div className="discover-page">
			<div className="discover-sections" key={ audience }>
				{ ! isCreators ? (
					<DeveloperDiscover />
				) : (
					<>
						<CreatorHero audience={ audience } />
						<div className="discover-mini-switch-anchor">
							<div className="discover-mini-switch">
								{ SHOWCASE_VERSIONS.map( ( value, index ) => (
									<button
										key={ value }
										type="button"
										aria-pressed={ showcaseVersion === value }
										onClick={ () => switchShowcaseVersion( value ) }
									>
										{ `V${ index + 1 }` }
									</button>
								) ) }
							</div>
						</div>
						<PageLayout>
							<VStack spacing={ 14 }>
								{ showcaseVersion === 'themes' ? (
									<ThemeShowcase audience={ audience } />
								) : (
									<BlueprintShowcase audience={ audience } />
								) }
								<VideoTutorials videos={ CREATOR_VIDEOS } audience={ audience } />
								<PanelGrid
									title={ __( 'Grow your audience' ) }
									panels={ getCreatorPanels() }
									audience={ audience }
								/>
								<NewsAndCommunity
									news={ getCreatorNews() }
									community={ getCreatorCommunity() }
									viewAllHref={ localizeUrl( 'https://wordpress.com/blog/' ) }
									audience={ audience }
								/>
								<HelpStrip links={ getCreatorHelpLinks() } audience={ audience } />
							</VStack>
						</PageLayout>
					</>
				) }
			</div>
		</div>
	);
}
