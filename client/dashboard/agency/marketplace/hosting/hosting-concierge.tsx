// POC: reuse the real Big Sky agent chat UI directly (the docked, dark variant).
// Production would route this through @automattic/agents-manager like the omnibar.
// eslint-disable-next-line no-restricted-imports
import AgentUI from '@automattic/agenttic-ui';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useState } from 'react';
import OverviewCard from '../../../components/overview-card';
import pressableDescriptor from '../exclusive-offers/images/pressable-descriptor.svg';
import vipDescriptor from '../exclusive-offers/images/vip-descriptor.svg';
import wpcomDescriptor from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
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

const BRAND_INFO: Record<
	HostingBrand[ 'key' ],
	{ logo: string; why: string; cta: 'configure' | 'demo' }
> = {
	wpcom: {
		logo: wpcomDescriptor,
		why: __(
			'Managed WordPress with staging, backups, and 24/7 support built in, so client sites just run — billed per site.'
		),
		cta: 'configure',
	},
	pressable: {
		logo: pressableDescriptor,
		why: __(
			'Traffic and storage pooled across all your client sites, with free migrations and pricing that keeps your margins healthy as you grow.'
		),
		cta: 'configure',
	},
	vip: {
		logo: vipDescriptor,
		why: __(
			'Enterprise-grade security, compliance, and dedicated support for high-scale, high-stakes sites.'
		),
		cta: 'demo',
	},
};

const GREETING = __(
	'Tell me about the client you’re setting up and I’ll recommend the right platform.'
);
const TYPE_PROMPT = __( 'What are you building for them?' );
const MGMT_PROMPT = __( 'And who’ll be running it day to day?' );

const TYPE_SUGGESTIONS: Suggestion[] = [
	{ id: 'content', label: __( 'A content or business site' ) },
	{ id: 'store', label: __( 'An online store' ) },
	{ id: 'enterprise', label: __( 'Enterprise or high-traffic' ) },
];

const MGMT_SUGGESTIONS: Suggestion[] = [
	{ id: 'client', label: __( 'The client manages it' ) },
	{ id: 'agency', label: __( 'We manage it' ) },
];

function RecommendationCard( {
	brand,
	onConfigure,
}: {
	brand: HostingBrand[ 'key' ];
	onConfigure: ( brand: HostingBrand[ 'key' ] ) => void;
} ) {
	const info = BRAND_INFO[ brand ];
	const name = hostingBrands.find( ( b ) => b.key === brand )?.name;
	return (
		<OverviewCard
			title={ __( 'Recommended for this client' ) }
			heading={
				<img src={ info.logo } alt={ name } className="marketplace-hosting__concierge-logo" />
			}
			description={ info.why }
			intent="success"
			shouldUseRouterLink={ false }
			bottom={
				info.cta === 'demo' ? (
					<Button
						variant="primary"
						__next40pxDefaultSize
						href={ VIP_DEMO_URL }
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'Request a demo ↗' ) }
					</Button>
				) : (
					<Button variant="primary" __next40pxDefaultSize onClick={ () => onConfigure( brand ) }>
						{ __( 'Configure' ) }
					</Button>
				)
			}
		/>
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

export default function HostingConcierge( {
	onConfigure,
	onClose,
}: {
	onConfigure: ( brand: HostingBrand[ 'key' ] ) => void;
	onClose: () => void;
} ) {
	const [ messages, setMessages ] = useState< Message[] >( () => [
		agentMessage( GREETING ),
		agentMessage( TYPE_PROMPT ),
	] );
	const [ suggestions, setSuggestions ] = useState< Suggestion[] >( TYPE_SUGGESTIONS );
	const [ stage, setStage ] = useState< 'type' | 'mgmt' | 'result' >( 'type' );

	const recommend = ( brand: HostingBrand[ 'key' ] ) => {
		const name = hostingBrands.find( ( b ) => b.key === brand )?.name ?? '';
		const intro = agentMessage(
			/* translators: %s: hosting brand name */
			__( 'Based on that, I’d put this client on %s. Here’s why:' ).replace( '%s', name )
		);
		const card: Message = {
			id: `rec-${ messageSeq++ }`,
			role: 'agent',
			content: [
				{
					type: 'component',
					component: RecommendationCard as unknown as ComponentType,
					componentProps: { brand, onConfigure },
				},
			],
			timestamp: messageSeq,
			archived: false,
			showIcon: false,
		};
		setMessages( ( current ) => [ ...current, intro, card ] );
		setSuggestions( [] );
		setStage( 'result' );
	};

	const handleSuggestionClick = ( suggestion: Suggestion ) => {
		setMessages( ( current ) => [ ...current, userMessage( suggestion.label ) ] );
		if ( stage === 'type' ) {
			if ( suggestion.id === 'store' ) {
				recommend( 'pressable' );
			} else if ( suggestion.id === 'enterprise' ) {
				recommend( 'vip' );
			} else {
				setMessages( ( current ) => [ ...current, agentMessage( MGMT_PROMPT ) ] );
				setSuggestions( MGMT_SUGGESTIONS );
				setStage( 'mgmt' );
			}
		} else if ( stage === 'mgmt' ) {
			recommend( suggestion.id === 'agency' ? 'pressable' : 'wpcom' );
		}
	};

	const handleSubmit = ( text: string ) => {
		if ( ! text.trim() ) {
			return;
		}
		setMessages( ( current ) => [
			...current,
			userMessage( text ),
			agentMessage(
				__( 'Tap one of the options below and I’ll point you to the right platform.' )
			),
		] );
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
				onSuggestionClick={ handleSuggestionClick }
				onSubmit={ handleSubmit }
				onClose={ onClose }
				isProcessing={ false }
				messagesPosition="bottom"
				placeholder={ __( 'Describe the client you’re setting up…' ) }
			/>
		</div>
	);
}
