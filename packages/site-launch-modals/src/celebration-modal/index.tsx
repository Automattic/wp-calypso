import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { copy, globe } from '@wordpress/icons';
import { useState } from 'react';
import ConfettiAnimation from '../confetti';

import './style.scss';

export interface CelebrationModalProps {
	siteDomain: string;
	siteUrl?: string;
	hasCustomDomain: boolean;
	isPaidPlan: boolean;
	isBilledMonthly: boolean;
	upsellHref: string;
	onUpsellClick: () => void;
	onClose: () => void;
}

export default function CelebrationModal( {
	siteDomain,
	siteUrl,
	hasCustomDomain,
	isPaidPlan,
	isBilledMonthly,
	upsellHref,
	onUpsellClick,
	onClose,
}: CelebrationModalProps ) {
	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const isMobileViewport = useViewportMatch( 'small', '<' );

	const handleCopy = () => {
		navigator.clipboard.writeText( siteDomain );
		setClipboardCopied( true );
		setTimeout( () => setClipboardCopied( false ), 2000 );
	};

	const renderUpsellContent = () => {
		let contentElement;
		let buttonText;

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
		} else if ( isPaidPlan && isBilledMonthly && ! hasCustomDomain ) {
			contentElement = (
				<Text as="p" className="flex-shrink-safe">
					{ __(
						'Interested in a custom domain? It’s free for the first year when you switch to annual billing.'
					) }
				</Text>
			);
			buttonText = __( 'Get your domain' );
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
		} else {
			return null;
		}

		const upsellButton = (
			<Button variant="primary" href={ upsellHref } onClick={ onUpsellClick }>
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
								variant="tertiary"
								size="compact"
								icon={ copy }
								label={ __( 'Copy URL' ) }
								onClick={ handleCopy }
								title={ clipboardCopied ? __( 'Copied!' ) : __( 'Copy URL' ) }
							/>
						</HStack>
						<Button icon={ globe } href={ siteUrl } target="_blank">
							{ __( 'View site' ) }
						</Button>
					</HStack>
				</div>
				{ renderUpsellContent() }
			</VStack>
		</Modal>
	);
}
