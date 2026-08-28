// POC: reuse the real Big Sky agent chat UI directly (the docked, dark variant).
// Production would route this through @automattic/agents-manager like the omnibar.
// eslint-disable-next-line no-restricted-imports
import AgentUI from '@automattic/agenttic-ui';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import pressableDescriptor from '../exclusive-offers/images/pressable-descriptor.svg';
import vipDescriptor from '../exclusive-offers/images/vip-descriptor.svg';
import wpcomDescriptor from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
import { CheckList } from './content-sections';
import { hostingBrands } from './mock-data';
import type { HostingBrand } from './mock-data';
// eslint-disable-next-line no-restricted-imports
import type { Message, Suggestion } from '@automattic/agenttic-ui/dist/types';
import type { ComponentType } from 'react';

// eslint-disable-next-line no-restricted-imports
import '@automattic/agenttic-ui/global.css';
// eslint-disable-next-line no-restricted-imports
import '@automattic/agenttic-ui/index.css';

const VIP_DEMO_URL =
	'https://wpvip.com/get-a-demo/?utm_source=partner&utm_medium=referral&utm_campaign=a4a';

type BillingModel = 'resell' | 'refer';

const BRAND_INFO: Record<
	HostingBrand[ 'key' ],
	{ logo: string; pitch: string; proof: string[]; cta: 'buy' | 'demo' }
> = {
	wpcom: {
		logo: wpcomDescriptor,
		pitch: __(
			'The low-touch, profitable pick for straightforward client sites. It’s managed WordPress your client can run themselves, so it stays off your support queue while you keep a clean per-site margin.'
		),
		proof: [
			__( 'Per-site pricing with volume discounts as you add sites' ),
			__( 'Free migrations to move the client over' ),
			__( 'Every site counts toward your Automattic for Agencies tier' ),
		],
		cta: 'buy',
	},
	pressable: {
		logo: pressableDescriptor,
		pitch: __(
			'Your margin engine. Pressable pools this site’s traffic and storage with the rest of your book, so your cost per site drops as you grow, and that spread is yours to keep. It’s also the performance tier for WooCommerce.'
		),
		proof: [
			__( 'Pooled plan: margin widens as your portfolio grows' ),
			__( 'Built for WooCommerce speed and reliability' ),
			__( 'Free white-glove migration, done for you' ),
			__( 'Counts toward your Automattic for Agencies tier' ),
		],
		cta: 'buy',
	},
	vip: {
		logo: vipDescriptor,
		pitch: __(
			'Enterprise-grade for high-stakes clients: media, government, and mission-critical sites. It’s a guided sale with dedicated support, and you earn a referral commission for bringing them in.'
		),
		proof: [
			__( 'Enterprise security, compliance, and dedicated support' ),
			__( 'Guided onboarding for your biggest clients' ),
			__( 'Up to 20% one-time referral commission' ),
		],
		cta: 'demo',
	},
};

const GREETING = __(
	'I’ll help you place this client on the right platform, and keep the margin on your side. What are you setting up for them?'
);
const MONEY_PROMPT = __(
	'Got it. How do you want to run the billing: host it under your plan and resell, or refer it and earn a commission?'
);
const BOOK_PROMPT = __( 'And how’s your client book with us looking right now?' );

const TYPE_SUGGESTIONS: Suggestion[] = [
	{
		id: 'content',
		label: __( 'Content or business site' ),
		prompt: __( 'Content or business site' ),
		autoSubmit: true,
	},
	{ id: 'store', label: __( 'Online store' ), prompt: __( 'Online store' ), autoSubmit: true },
	{
		id: 'enterprise',
		label: __( 'Enterprise or high-traffic' ),
		prompt: __( 'Enterprise or high-traffic' ),
		autoSubmit: true,
	},
];

const MONEY_SUGGESTIONS: Suggestion[] = [
	{
		id: 'resell',
		label: __( 'Host it and resell' ),
		prompt: __( 'Host it and resell' ),
		autoSubmit: true,
	},
	{
		id: 'refer',
		label: __( 'Refer for commission' ),
		prompt: __( 'Refer for commission' ),
		autoSubmit: true,
	},
];

const BOOK_SUGGESTIONS: Suggestion[] = [
	{
		id: 'starting',
		label: __( 'Just getting started' ),
		prompt: __( 'Just getting started' ),
		autoSubmit: true,
	},
	{
		id: 'growing',
		label: __( 'Growing, I host a bunch' ),
		prompt: __( 'Growing, I host a bunch' ),
		autoSubmit: true,
	},
];

const MIGRATE_PROMPT = __( 'Is this a fresh build, or are you moving an existing site over?' );
const MIGRATE_SUGGESTIONS: Suggestion[] = [
	{ id: 'new', label: __( 'A new build' ), prompt: __( 'A new build' ), autoSubmit: true },
	{
		id: 'migrating',
		label: __( 'Migrating an existing site' ),
		prompt: __( 'Migrating an existing site' ),
		autoSubmit: true,
	},
];

function RecommendationCard( {
	brand,
	billing,
	onConfigure,
}: {
	brand: HostingBrand[ 'key' ];
	billing: BillingModel;
	onConfigure: ( brand: HostingBrand[ 'key' ], billing: BillingModel ) => void;
} ) {
	const info = BRAND_INFO[ brand ];
	const name = hostingBrands.find( ( b ) => b.key === brand )?.name;
	return (
		<Card className="marketplace-hosting__concierge-rec">
			<CardBody>
				<VStack spacing={ 3 }>
					<HStack justify="space-between" alignment="center">
						<HStack spacing={ 2 } alignment="center" justify="flex-start" expanded={ false }>
							<img src={ info.logo } alt="" className="marketplace-hosting__concierge-mark" />
							<Text weight={ 600 }>{ name }</Text>
						</HStack>
						<span className="marketplace-hosting__concierge-rec-badge">
							{ __( 'Recommended' ) }
						</span>
					</HStack>
					<Text>{ info.pitch }</Text>
					<CheckList items={ info.proof } />
					{ info.cta === 'demo' ? (
						<ButtonStack justify="flex-start">
							<Button
								variant="primary"
								__next40pxDefaultSize
								href={ VIP_DEMO_URL }
								target="_blank"
								rel="noreferrer"
							>
								{ __( 'Request a demo ↗' ) }
							</Button>
						</ButtonStack>
					) : (
						<VStack spacing={ 2 } alignment="flex-start">
							<Button
								variant="primary"
								__next40pxDefaultSize
								onClick={ () => onConfigure( brand, billing ) }
							>
								{ billing === 'refer'
									? __( 'Add to referral cart' )
									: __( 'Configure and add to cart' ) }
							</Button>
							<Text variant="muted" size={ 12 }>
								{ billing === 'refer'
									? __( 'Your client is billed directly; you earn commission on every renewal.' )
									: __( 'You’re billed and keep the margin. Switch to referral anytime.' ) }
							</Text>
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

let messageSeq = 0;
const agentMessage = ( text: string ): Message => ( {
	id: `a-${ messageSeq++ }`,
	role: 'agent',
	content: [ { type: 'text', text } ],
	timestamp: messageSeq,
	archived: false,
	showIcon: true,
} );
const userMessage = ( text: string ): Message => ( {
	id: `u-${ messageSeq++ }`,
	role: 'user',
	content: [ { type: 'text', text } ],
	timestamp: messageSeq,
	archived: false,
	showIcon: false,
} );

type Stage = 'type' | 'migrate' | 'money' | 'book' | 'result';

export default function HostingConcierge( {
	onConfigure,
	onClose,
}: {
	onConfigure: ( brand: HostingBrand[ 'key' ], billing: BillingModel ) => void;
	onClose: () => void;
} ) {
	const [ messages, setMessages ] = useState< Message[] >( () => [ agentMessage( GREETING ) ] );
	const [ suggestions, setSuggestions ] = useState< Suggestion[] >( TYPE_SUGGESTIONS );
	const [ stage, setStage ] = useState< Stage >( 'type' );

	useEffect( () => {
		document.documentElement.classList.add( 'has-docked-concierge' );
		const onKey = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				onClose();
			}
		};
		document.addEventListener( 'keydown', onKey );
		return () => {
			document.documentElement.classList.remove( 'has-docked-concierge' );
			document.removeEventListener( 'keydown', onKey );
		};
	}, [ onClose ] );

	const migratingRef = useRef( false );

	const recommend = ( brand: HostingBrand[ 'key' ], model: BillingModel, why: string ) => {
		const card: Message = {
			id: `rec-${ messageSeq++ }`,
			role: 'agent',
			content: [
				{
					type: 'component',
					component: RecommendationCard as unknown as ComponentType,
					componentProps: { brand, billing: model, onConfigure },
				},
			],
			timestamp: messageSeq,
			archived: false,
			showIcon: false,
		};
		setMessages( ( current ) => {
			const next = [ ...current, agentMessage( why ), card ];
			if ( migratingRef.current ) {
				next.push(
					agentMessage(
						brand === 'pressable'
							? __( 'And since you’re migrating, Pressable does it white-glove for free.' )
							: __( 'And since you’re migrating, we’ll move the site over for free.' )
					)
				);
			}
			return next;
		} );
		setSuggestions( [] );
		setStage( 'result' );
	};

	const ask = ( prompt: string, nextSuggestions: Suggestion[], nextStage: Stage ) => {
		setMessages( ( current ) => [ ...current, agentMessage( prompt ) ] );
		setSuggestions( nextSuggestions );
		setStage( nextStage );
	};

	const nudge = () =>
		setMessages( ( current ) => [
			...current,
			agentMessage( __( 'Tap one of the options and I’ll point you to the right platform.' ) ),
		] );

	const [ clientType, setClientType ] = useState< string >( '' );

	const handleSubmit = ( text: string ) => {
		const value = text.trim();
		if ( ! value ) {
			return;
		}
		setMessages( ( current ) => [ ...current, userMessage( value ) ] );

		if ( stage === 'type' ) {
			const option = TYPE_SUGGESTIONS.find( ( s ) => s.label === value );
			if ( option?.id === 'enterprise' || option?.id === 'content' || option?.id === 'store' ) {
				setClientType( option.id );
				ask( MIGRATE_PROMPT, MIGRATE_SUGGESTIONS, 'migrate' );
			} else {
				nudge();
			}
		} else if ( stage === 'migrate' ) {
			const option = MIGRATE_SUGGESTIONS.find( ( s ) => s.label === value );
			if ( ! option ) {
				nudge();
				return;
			}
			migratingRef.current = option.id === 'migrating';
			if ( clientType === 'enterprise' ) {
				recommend(
					'vip',
					'refer',
					__(
						'For an enterprise or high-traffic client, that’s WordPress VIP. It’s a guided sale, so the play here is to refer them in and earn the commission:'
					)
				);
			} else {
				ask( MONEY_PROMPT, MONEY_SUGGESTIONS, 'money' );
			}
		} else if ( stage === 'money' ) {
			const option = MONEY_SUGGESTIONS.find( ( s ) => s.label === value );
			if ( ! option ) {
				nudge();
				return;
			}
			const model = option.id as BillingModel;

			if ( clientType === 'store' ) {
				recommend(
					'pressable',
					model,
					model === 'refer'
						? __(
								'A store means Pressable for the performance, and since you’re referring it, you’ll earn commission while your client is billed directly:'
						  )
						: __(
								'For a store, Pressable is the pick. It’s built for WooCommerce, and reselling it lets you pool it with your other sites to protect your margin:'
						  )
				);
			} else if ( model === 'refer' ) {
				recommend(
					'wpcom',
					'refer',
					__(
						'For a straightforward site you’re referring, WordPress.com keeps it simple for the client and pays you a commission with zero billing to manage:'
					)
				);
			} else {
				ask( BOOK_PROMPT, BOOK_SUGGESTIONS, 'book' );
			}
		} else if ( stage === 'book' ) {
			const option = BOOK_SUGGESTIONS.find( ( s ) => s.label === value );
			if ( ! option ) {
				nudge();
				return;
			}
			if ( option.id === 'growing' ) {
				recommend(
					'pressable',
					'resell',
					__(
						'Since you’re building a book of sites, put this one on Pressable. Its pooled plan means every site you add widens your margin instead of stacking per-site costs:'
					)
				);
			} else {
				recommend(
					'wpcom',
					'resell',
					__(
						'While you’re getting started, WordPress.com keeps this low-touch and profitable per site. When your book grows, Pressable’s pooled pricing becomes the better margin play:'
					)
				);
			}
		} else {
			nudge();
		}
	};

	return (
		<div className="marketplace-hosting__concierge agenttic dark">
			<div className="marketplace-hosting__concierge-header">
				<span>{ __( 'Hosting concierge' ) }</span>
				<Button size="small" icon={ closeSmall } label={ __( 'Close' ) } onClick={ onClose } />
			</div>
			<AgentUI
				className="agenttic dark marketplace-hosting__concierge-agent"
				variant="embedded"
				messages={ messages }
				suggestions={ suggestions }
				onSubmit={ handleSubmit }
				onClose={ onClose }
				isProcessing={ false }
				messagesPosition="bottom"
				placeholder={ __( 'Describe the client you’re setting up…' ) }
			/>
		</div>
	);
}
