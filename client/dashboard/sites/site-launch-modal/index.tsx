import { useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Icon,
	Modal,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { copy, globe, payment } from '@wordpress/icons';
import { useState, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import ConfettiAnimation from '../../components/confetti';
import { getAddSiteDomainUrl } from '../../utils/domain-url';
import { getSitePlanDisplayName } from '../../utils/site-plan';
import SitePreview from '../site-preview';
import type { Site } from '@automattic/api-core';
import './styles.scss';

const THUMBNAIL_WIDTH = 96;
const THUMBNAIL_HEIGHT = 64;
const PREVIEW_BASE_WIDTH = 1200;

export type CelebrationSite = Pick< Site, 'ID' | 'slug' | 'URL' > & {
	plan?: Pick< Required< Site >[ 'plan' ], 'is_free' | 'product_slug' >;
};

interface CommonProps {
	isOpen: boolean;
	onClose: () => void;
}

interface CelebrationVariantProps extends CommonProps {
	variant: 'celebration';
	site: CelebrationSite;
}

interface PreLaunchVariantProps extends CommonProps {
	variant: 'pre-launch';
	site: Site;
	isLaunching: boolean;
	onLaunch: () => void;
}

type SiteLaunchModalProps = CelebrationVariantProps | PreLaunchVariantProps;

export default function SiteLaunchModal( props: SiteLaunchModalProps ) {
	const { isOpen, onClose } = props;
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();
	const { data: domains = [], isFetchedAfterMount: isDomainsDataReady } = useQuery( {
		...queries.domainsQuery(),
		enabled: isOpen,
		select: ( data ) => data.filter( ( domain ) => domain.blog_id === props.site.ID ),
	} );
	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const copyButtonRef = useRef< HTMLButtonElement >( null );
	const isMobileViewport = useViewportMatch( 'small', '<' );

	if ( ! isOpen ) {
		return null;
	}

	// The celebration variant needs the domain list settled to decide upsell
	// content; the pre-launch variant is opened from the launch button, which
	// has already loaded the domains, so it can render with cached data.
	if ( props.variant === 'celebration' && ! isDomainsDataReady ) {
		return null;
	}

	const customDomains = domains.filter( ( domain ) => domain.subscription_id !== null );
	const hasCustomDomain = customDomains.length > 0;
	const siteDomain = hasCustomDomain ? customDomains[ 0 ].domain : props.site.slug;

	if ( props.variant === 'pre-launch' ) {
		const { site, isLaunching, onLaunch } = props;
		const planName = site.plan?.product_name ?? getSitePlanDisplayName( site );

		return (
			<Modal
				className="site-launch-pre-launch-modal"
				title={ __( 'Launching makes your site public.' ) }
				size="medium"
				onRequestClose={ onClose }
			>
				<VStack spacing={ 6 }>
					<Text as="p">
						{ __(
							'Share your work, connect with your audience, and take the next step toward your goals. Do you want to launch?'
						) }
					</Text>
					<HStack
						className="site-launch-pre-launch-modal__preview-card"
						spacing={ 4 }
						alignment="center"
						justify="flex-start"
					>
						{ site.URL && (
							<div className="site-launch-pre-launch-modal__thumbnail">
								<SitePreview
									url={ site.URL }
									scale={ THUMBNAIL_WIDTH / PREVIEW_BASE_WIDTH }
									height={ THUMBNAIL_HEIGHT / ( THUMBNAIL_WIDTH / PREVIEW_BASE_WIDTH ) }
								/>
							</div>
						) }
						<VStack spacing={ 1 } className="site-launch-pre-launch-modal__meta">
							<Text size={ 16 } weight={ 400 } truncate>
								{ site.name }
							</Text>
							<HStack spacing={ 2 } justify="flex-start" alignment="center">
								<Icon icon={ globe } size={ 20 } />
								<Text truncate>{ siteDomain }</Text>
							</HStack>
							<HStack spacing={ 2 } justify="flex-start" alignment="center">
								<Icon icon={ payment } size={ 20 } />
								<Text truncate>{ planName }</Text>
							</HStack>
						</VStack>
					</HStack>
					<HStack justify="flex-end">
						<Button
							variant="primary"
							isBusy={ isLaunching }
							disabled={ isLaunching }
							onClick={ onLaunch }
						>
							{ __( 'Yes, launch site!' ) }
						</Button>
					</HStack>
				</VStack>
			</Modal>
		);
	}

	const { site } = props;
	const isPaidPlan = ! site.plan?.is_free;
	const isBilledMonthly = site.plan?.product_slug?.includes( 'monthly' );

	const handleCopy = () => {
		navigator.clipboard.writeText( siteDomain );
		setClipboardCopied( true );
		setTimeout( () => setClipboardCopied( false ), 2000 );
	};

	const renderUpsellContent = () => {
		let contentElement;
		let buttonText;
		let buttonHref;

		if ( ! isPaidPlan && ! hasCustomDomain ) {
			contentElement = (
				<Text as="p" className="flex-shrink-safe">
					{ createInterpolateElement(
						__(
							'Supercharge your website with a <strong>custom address</strong> that matches your blog, brand, or business.'
						),
						{ strong: <strong /> }
					) }
				</Text>
			);
			buttonText = __( 'Get your domain' );
			buttonHref = getAddSiteDomainUrl( site.slug );
		} else if ( isPaidPlan && isBilledMonthly && ! hasCustomDomain ) {
			contentElement = (
				<Text as="p" className="flex-shrink-safe">
					{ __(
						'Interested in a custom domain? It’s free for the first year when you switch to annual billing.'
					) }
				</Text>
			);
			buttonText = __( 'Get your domain' );
			buttonHref = getAddSiteDomainUrl( site.slug );
		} else if ( isPaidPlan && ! hasCustomDomain ) {
			contentElement = (
				<Text as="p" className="flex-shrink-safe">
					{ createInterpolateElement(
						__(
							'Your paid plan includes a domain name <strong>free for one year</strong>. Choose one that’s easy to remember and even easier to share.'
						),
						{ strong: <strong /> }
					) }
				</Text>
			);
			buttonText = __( 'Get your free domain' );
			buttonHref = getAddSiteDomainUrl( site.slug );
		} else {
			return null;
		}

		const upsellButton = (
			<Button
				variant="primary"
				href={ buttonHref }
				onClick={ () =>
					recordTracksEvent( 'calypso_launchpad_celebration_modal_upsell_clicked', {
						product_slug: site?.plan?.product_slug,
					} )
				}
			>
				{ buttonText }
			</Button>
		);

		return isMobileViewport ? (
			<VStack spacing={ 4 } alignment="left">
				{ contentElement }
				{ upsellButton }
			</VStack>
		) : (
			<HStack spacing={ 3 } alignment="bottomRight">
				{ contentElement }
				{ upsellButton }
			</HStack>
		);
	};

	return (
		<Modal
			className="celebration-modal"
			title={ __( 'Congrats, your site is live!' ) }
			size="medium"
			onRequestClose={ onClose }
		>
			<ConfettiAnimation />
			<VStack spacing={ 6 }>
				<Text as="p">
					{ __( 'Now you can head over to your site and share it with the world.' ) }
				</Text>
				<div className="celebration-modal--content">
					<HStack>
						<HStack className="celebration-modal--url-container flex-shrink-safe">
							<Text as="p" weight={ 600 } truncate>
								{ siteDomain }
							</Text>
							<Button
								ref={ copyButtonRef }
								variant="tertiary"
								size="compact"
								icon={ copy }
								label={ __( 'Copy URL' ) }
								onClick={ handleCopy }
								title={ clipboardCopied ? __( 'Copied!' ) : __( 'Copy URL' ) }
							/>
						</HStack>
						<Button icon={ globe } href={ site.URL } target="_blank">
							{ __( 'View site' ) }
						</Button>
					</HStack>
				</div>
				{ renderUpsellContent() }
			</VStack>
		</Modal>
	);
}
