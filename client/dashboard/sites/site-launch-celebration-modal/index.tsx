import ConfettiAnimation from '@automattic/components/src/confetti';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { copy, globe } from '@wordpress/icons';
import { useState, useRef } from 'react';
import type { Domain, Site } from '@automattic/api-core';

interface SiteLaunchCelebrationModalProps {
	site: Site;
	domains?: Domain[];
	onClose: () => void;
}

export default function SiteLaunchCelebrationModal( {
	site,
	onClose,
	domains = [],
}: SiteLaunchCelebrationModalProps ) {
	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const copyButtonRef = useRef< HTMLButtonElement >( null );

	const isPaidPlan = ! site.plan?.is_free;
	const isBilledMonthly = site.plan?.product_slug?.includes( 'monthly' );
	const customDomains = domains.filter( ( domain ) => ! domain.wpcom_domain );
	const hasCustomDomain = customDomains.length > 0;

	const handleCopy = () => {
		navigator.clipboard.writeText( site.URL );
		setClipboardCopied( true );
		setTimeout( () => setClipboardCopied( false ), 2000 );
	};

	const renderUpsellContent = () => {
		const hasEnTranslation = useHasEnTranslation();

		if ( hasCustomDomain ) {
			return null;
		}

		let contentElement;
		let buttonText;
		let buttonHref;

		if ( ! isPaidPlan ) {
			contentElement = (
				<Text as="p">
					{ createInterpolateElement(
						__(
							'Supercharge your website with a <strong>custom address</strong> that matches your blog, brand, or business.'
						),
						{ strong: <strong /> }
					) }
				</Text>
			);
			buttonText = hasEnTranslation( 'Get your domain' )
				? __( 'Get your domain' )
				: __( 'Claim your domain' );
			buttonHref = `/domains/add/${ site.slug }`;
		} else if ( isBilledMonthly ) {
			contentElement = (
				<Text as="p">
					{ __(
						"Interested in a custom domain? It's free for the first year when you switch to annual billing."
					) }
				</Text>
			);
			buttonText = hasEnTranslation( 'Get your domain' )
				? __( 'Get your domain' )
				: __( 'Claim your domain' );
			buttonHref = `/domains/add/${ site.slug }`;
		} else {
			contentElement = (
				<Text as="p">
					{ createInterpolateElement(
						__(
							'Your paid plan includes a domain name <strong>free for one year</strong>. Choose one that`s easy to remember and even easier to share.'
						),
						{ strong: <strong /> }
					) }
				</Text>
			);
			buttonText = hasEnTranslation( 'Get your free domain' )
				? __( 'Get your free domain' )
				: __( 'Claim your free domain' );
			buttonHref = `/domains/add/${ site.slug }`;
		}

		return (
			<HStack spacing={ 3 }>
				{ contentElement }
				<Button variant="primary" href={ buttonHref }>
					{ buttonText }
				</Button>
			</HStack>
		);
	};

	return (
		<Modal title={ __( 'Congrats, your site is live!' ) } size="medium" onRequestClose={ onClose }>
			<ConfettiAnimation />
			<VStack spacing={ 3 }>
				<Text as="p">
					{ __( 'Now you can head over to your site and share it with the world.' ) }
				</Text>
				<HStack>
					<HStack>
						<Text as="p" weight={ 600 }>
							{ site.URL }
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
					<Button variant="tertiary" icon={ globe } href={ site.URL } target="_blank">
						{ __( 'View site' ) }
					</Button>
				</HStack>
				{ renderUpsellContent() }
			</VStack>
		</Modal>
	);
}
