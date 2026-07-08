import { useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { useEvent } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { copy, globe } from '@wordpress/icons';
import { removeQueryArgs } from '@wordpress/url';
import { useEffect, useState, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import ConfettiAnimation from '../../components/confetti';
import { getAddSiteDomainUrl } from '../../utils/domain-url';
import type { Site } from '@automattic/api-core';
import './styles.scss';

interface SiteLaunchCelebrationModalProps {
	site: Pick< Site, 'ID' | 'slug' | 'URL' | 'launch_status' > & {
		plan?: Pick< Required< Site >[ 'plan' ], 'is_free' | 'product_slug' >;
	};
	onOpen?(): void;
	onClose?(): void;
}

export default function SiteLaunchCelebrationModal( {
	site,
	onOpen: externalOnOpen,
	onClose,
}: SiteLaunchCelebrationModalProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();
	const { data: domains = [], isFetchedAfterMount: isDomainsDataReady } = useQuery( {
		...queries.domainsQuery(),
		enabled: isOpen,
		select: ( data ) => data.filter( ( domain ) => domain.blog_id === site.ID ),
	} );
	const copyButtonRef = useRef< HTMLButtonElement >( null );

	const onOpen = useEvent( () => {
		externalOnOpen?.();
		setIsOpen( true );

		// Track the modal view
		recordTracksEvent( 'calypso_launchpad_celebration_modal_view', {
			product_slug: site?.plan?.product_slug,
		} );
	} );

	// Check if celebration modal should be shown based on URL param and site launch status
	useEffect( () => {
		const hasCelebrateLaunch = new URLSearchParams( window.location.search ).has(
			'celebrateLaunch'
		);
		const isSiteLaunched = site.launch_status === 'launched' || site.launch_status === false;

		if ( isSiteLaunched && hasCelebrateLaunch ) {
			onOpen();
		}
	}, [ site.launch_status, onOpen ] );

	if ( ! isOpen || ! isDomainsDataReady ) {
		return null;
	}

	const isPaidPlan = ! site.plan?.is_free;
	const isBilledMonthly = site.plan?.product_slug?.includes( 'monthly' );
	const customDomains = domains.filter( ( domain ) => domain.subscription_id !== null );
	const hasCustomDomain = customDomains.length > 0;
	const siteDomain = hasCustomDomain ? customDomains[ 0 ].domain : site.slug;

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

		return (
			<HStack spacing={ 3 } alignment="bottomRight">
				{ contentElement }
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
			</HStack>
		);
	};

	return (
		<Modal
			className="celebration-modal"
			title={ __( 'Congrats, your site is live!' ) }
			size="medium"
			onRequestClose={ () => {
				setIsOpen( false );
				onClose?.();

				// Remove the celebrateLaunch URL param without reloading the page
				window.history.replaceState(
					null,
					'',
					removeQueryArgs( window.location.href, 'celebrateLaunch' )
				);
			} }
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
