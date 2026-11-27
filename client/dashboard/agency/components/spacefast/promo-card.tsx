import {
	Button,
	Icon,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { focus } from '@wordpress/dom';
import { __ } from '@wordpress/i18n';
import { check, close, pause, play } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import NewTabLabel from '../new-tab-label';
import { SPACEFAST_REDEEM_URL } from './constants';
import SpacefastLogo from './spacefast-logo';
import SpacefastTermsModal from './terms-modal';
import type { ReactNode } from 'react';

import './promo-card.scss';

interface SpacefastPromoCardProps {
	title: string;
	description: string;
	features: string[];
	/** Shown in turn after the logo, each with its label. */
	samples: { image: string; label: string }[];
	onRedeemClick: () => void;
	/** Links shown after the redeem button. */
	secondaryActions?: ReactNode;
	/** Adds a close button. Focus moves on to what follows the card before this is called. */
	onClose?: () => void;
}

/**
 * The Spacefast launch promo card shared by the Dev tools and Prospect reports pages:
 * Spacefast's green panel with its logo and a loop of samples beside the offer. Temporary:
 * delete it with the promos when the launch offer ends.
 */
export default function SpacefastPromoCard( {
	title,
	description,
	features,
	samples,
	onRedeemClick,
	secondaryActions,
	onClose,
}: SpacefastPromoCardProps ) {
	const cardRef = useRef< HTMLElement >( null );
	const [ isTermsOpen, setIsTermsOpen ] = useState( false );
	const [ isPaused, setIsPaused ] = useState( false );

	const handleClose = () => {
		// The card is about to unmount, so hand focus to the next stop after it instead
		// of letting it fall back to the page.
		const card = cardRef.current;
		const next = card
			? focus.tabbable
					.find( card.ownerDocument.body )
					.find(
						( element ) =>
							! card.contains( element ) &&
							!! ( card.compareDocumentPosition( element ) & Node.DOCUMENT_POSITION_FOLLOWING )
					)
			: undefined;
		( next as HTMLElement | undefined )?.focus();
		onClose?.();
	};

	return (
		<Card ref={ cardRef } size="large" className="a4a-spacefast-promo">
			<div className="a4a-spacefast-promo__layout">
				<div className={ clsx( 'a4a-spacefast-promo__media', { 'is-paused': isPaused } ) }>
					<SpacefastLogo className="a4a-spacefast-promo__logo" />
					<SpacefastLogo className="a4a-spacefast-promo__logo-badge" />
					<span className="a4a-spacefast-promo__captions" aria-hidden="true">
						{ samples.map( ( { label } ) => (
							<span key={ label } className="a4a-spacefast-promo__caption">
								{ label }
							</span>
						) ) }
						<span className="a4a-spacefast-promo__tagline">
							{ __( 'Build anything. Live in seconds.' ) }
						</span>
					</span>
					{ samples.map( ( { image } ) => (
						<img
							key={ image }
							className="a4a-spacefast-promo__sample"
							src={ image }
							alt=""
							loading="lazy"
							decoding="async"
						/>
					) ) }
					<Button
						className="a4a-spacefast-promo__playback"
						icon={ isPaused ? play : pause }
						label={ isPaused ? __( 'Play' ) : __( 'Pause' ) }
						size="small"
						onClick={ () => setIsPaused( ! isPaused ) }
					/>
				</div>
				<CardBody className="a4a-spacefast-promo__body">
					{ onClose && (
						<Button
							className="a4a-spacefast-promo__close"
							icon={ close }
							size="small"
							label={ __( 'Close' ) }
							onClick={ handleClose }
						/>
					) }
					<VStack spacing={ 4 } alignment="flex-start">
						<HStack
							alignment="left"
							wrap
							className={ clsx( 'a4a-spacefast-promo__title', { 'is-dismissible': !! onClose } ) }
						>
							<Heading level={ 2 } size={ 20 } weight={ 500 }>
								{ title }
							</Heading>
							<Badge intent="stable">{ __( 'New' ) }</Badge>
							<Badge intent="draft">{ __( 'Build with AI' ) }</Badge>
						</HStack>
						<Text size={ 15 }>{ description }</Text>
						<VStack as="ul" role="list" spacing={ 1 } className="a4a-spacefast-promo__features">
							{ features.map( ( feature ) => (
								<HStack as="li" key={ feature } alignment="topLeft" spacing={ 1 }>
									<Icon icon={ check } size={ 24 } className="a4a-spacefast-promo__check" />
									<Text size={ 15 } lineHeight="24px">
										{ feature }
									</Text>
								</HStack>
							) ) }
						</VStack>
						<HStack alignment="left" spacing={ 4 } wrap>
							<Button
								__next40pxDefaultSize
								variant="primary"
								href={ SPACEFAST_REDEEM_URL }
								target="_blank"
								rel="noreferrer"
								onClick={ onRedeemClick }
							>
								<NewTabLabel>{ __( 'Start your 30 days' ) }</NewTabLabel>
							</Button>
							{ secondaryActions }
							<Button variant="link" onClick={ () => setIsTermsOpen( true ) }>
								{ __( 'Offer terms' ) }
							</Button>
						</HStack>
						{ isTermsOpen && <SpacefastTermsModal onClose={ () => setIsTermsOpen( false ) } /> }
					</VStack>
				</CardBody>
			</div>
		</Card>
	);
}
