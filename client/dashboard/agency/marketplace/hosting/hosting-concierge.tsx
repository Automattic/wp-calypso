import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useState } from 'react';
import OverviewCard from '../../../components/overview-card';
import pressableDescriptor from '../exclusive-offers/images/pressable-descriptor.svg';
import vipDescriptor from '../exclusive-offers/images/vip-descriptor.svg';
import wpcomDescriptor from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
import { hostingBrands } from './mock-data';
import type { HostingBrand } from './mock-data';

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

type Choice = { value: string; label: string };
type Stage = 'type' | 'mgmt' | 'result';
type Message = { role: 'assistant' | 'user'; text: string };

const TYPE_CHOICES: Choice[] = [
	{ value: 'content', label: __( 'A content or business site' ) },
	{ value: 'store', label: __( 'An online store' ) },
	{ value: 'enterprise', label: __( 'Enterprise or high-traffic' ) },
];

const MGMT_CHOICES: Choice[] = [
	{ value: 'client', label: __( 'The client manages it' ) },
	{ value: 'agency', label: __( 'We manage it' ) },
];

const GREETING = __(
	'Tell me about the client you’re setting up and I’ll recommend the right platform.'
);
const TYPE_PROMPT = __( 'What are you building for them?' );
const MGMT_PROMPT = __( 'And who’ll be running it day to day?' );

export default function HostingConcierge( {
	onConfigure,
	onClose,
}: {
	onConfigure: ( brand: HostingBrand[ 'key' ] ) => void;
	onClose: () => void;
} ) {
	const [ thread, setThread ] = useState< Message[] >( [
		{ role: 'assistant', text: GREETING },
		{ role: 'assistant', text: TYPE_PROMPT },
	] );
	const [ stage, setStage ] = useState< Stage >( 'type' );
	const [ recommended, setRecommended ] = useState< HostingBrand[ 'key' ] | null >( null );

	const say = ( messages: Message[] ) => setThread( ( current ) => [ ...current, ...messages ] );

	const recommend = ( brand: HostingBrand[ 'key' ] ) => {
		const name = hostingBrands.find( ( b ) => b.key === brand )?.name ?? '';
		say( [
			{
				role: 'assistant',
				/* translators: %s: hosting brand name */
				text: __( 'Based on that, I’d put this client on %s. Here’s why:' ).replace( '%s', name ),
			},
		] );
		setRecommended( brand );
		setStage( 'result' );
	};

	const pickType = ( choice: Choice ) => {
		say( [ { role: 'user', text: choice.label } ] );
		if ( choice.value === 'store' ) {
			recommend( 'pressable' );
		} else if ( choice.value === 'enterprise' ) {
			recommend( 'vip' );
		} else {
			say( [ { role: 'assistant', text: MGMT_PROMPT } ] );
			setStage( 'mgmt' );
		}
	};

	const pickMgmt = ( choice: Choice ) => {
		say( [ { role: 'user', text: choice.label } ] );
		recommend( choice.value === 'agency' ? 'pressable' : 'wpcom' );
	};

	const restart = () => {
		setThread( [
			{ role: 'assistant', text: GREETING },
			{ role: 'assistant', text: TYPE_PROMPT },
		] );
		setStage( 'type' );
		setRecommended( null );
	};

	let chips: Choice[] = [];
	if ( stage === 'type' ) {
		chips = TYPE_CHOICES;
	} else if ( stage === 'mgmt' ) {
		chips = MGMT_CHOICES;
	}
	const onChip = stage === 'type' ? pickType : pickMgmt;

	return (
		<div
			className="marketplace-hosting__concierge"
			role="dialog"
			aria-label={ __( 'Hosting concierge' ) }
		>
			<HStack
				className="marketplace-hosting__concierge-header"
				justify="space-between"
				alignment="center"
			>
				<Heading level={ 2 } size={ 15 }>
					{ __( 'Hosting concierge' ) }
				</Heading>
				<Button size="small" icon={ closeSmall } label={ __( 'Close' ) } onClick={ onClose } />
			</HStack>

			<VStack className="marketplace-hosting__concierge-body" spacing={ 3 }>
				{ thread.map( ( message, index ) => (
					<div
						key={ index }
						className={ `marketplace-hosting__concierge-msg is-${ message.role }` }
					>
						<Text>{ message.text }</Text>
					</div>
				) ) }

				{ recommended && (
					<OverviewCard
						icon={ undefined }
						title={ __( 'Recommended for this client' ) }
						heading={
							<img
								src={ BRAND_INFO[ recommended ].logo }
								alt={ hostingBrands.find( ( b ) => b.key === recommended )?.name }
								className="marketplace-hosting__concierge-logo"
							/>
						}
						description={ BRAND_INFO[ recommended ].why }
						intent="success"
						shouldUseRouterLink={ false }
						bottom={
							BRAND_INFO[ recommended ].cta === 'demo' ? (
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
								<Button
									variant="primary"
									__next40pxDefaultSize
									onClick={ () => onConfigure( recommended ) }
								>
									{ __( 'Configure' ) }
								</Button>
							)
						}
					/>
				) }

				{ chips.length > 0 && (
					<div className="marketplace-hosting__concierge-chips">
						{ chips.map( ( choice ) => (
							<Button
								key={ choice.value }
								variant="secondary"
								size="compact"
								onClick={ () => onChip( choice ) }
							>
								{ choice.label }
							</Button>
						) ) }
					</div>
				) }

				{ stage === 'result' && (
					<Button
						variant="link"
						className="marketplace-hosting__concierge-restart"
						onClick={ restart }
					>
						{ __( 'Start over' ) }
					</Button>
				) }
			</VStack>
		</div>
	);
}
