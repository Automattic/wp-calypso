import {
	Button,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useReducedMotion, useViewportMatch } from '@wordpress/compose';
import { __, isRTL } from '@wordpress/i18n';
import { check, chevronLeft, chevronRight, closeSmall } from '@wordpress/icons';
import { useLayoutEffect, useRef } from 'react';
import ResourceBadges from './resource-badges';
import ResourcePreview from './resource-preview';
import type { FilterResources } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceModalProps {
	resource: AgencyEnablementResource;
	onClose: () => void;
	onPrevious?: () => void;
	onNext?: () => void;
	onOpen: ( resource: AgencyEnablementResource ) => void;
	onFilter: FilterResources;
	isRead: boolean;
	onToggleRead: () => void;
	/** Where the modal was opened from, so it can grow out of that card or row. */
	origin?: DOMRect;
}

/**
 * A resource's details, with previous and next controls for moving through the
 * library's current results.
 */
export default function ResourceModal( {
	resource,
	onClose,
	onPrevious,
	onNext,
	onOpen,
	onFilter,
	isRead,
	onToggleRead,
	origin,
}: ResourceModalProps ) {
	// Previous points back along the reading direction, so it swaps in RTL.
	const [ previousKey, nextKey, previousIcon, nextIcon ] = isRTL()
		? ( [ 'ArrowRight', 'ArrowLeft', chevronRight, chevronLeft ] as const )
		: ( [ 'ArrowLeft', 'ArrowRight', chevronLeft, chevronRight ] as const );

	const contentRef = useRef< HTMLDivElement >( null );
	const isReducedMotion = useReducedMotion();
	// Below this the modal is a bottom sheet, which keeps its own slide-up.
	const isCentered = useViewportMatch( 'small' );

	// Grows the modal out of the card or row it was opened from.
	useLayoutEffect( () => {
		const frame = contentRef.current?.closest< HTMLElement >( '.dashboard-resources-learn__modal' );
		if ( ! frame || ! origin || isReducedMotion || ! isCentered ) {
			return;
		}

		const bounds = frame.getBoundingClientRect();
		const x = origin.x + origin.width / 2 - ( bounds.x + bounds.width / 2 );
		const y = origin.y + origin.height / 2 - ( bounds.y + bounds.height / 2 );
		const animation = frame.animate(
			[
				{
					transform: `translate( ${ x }px, ${ y }px ) scale( ${ origin.width / bounds.width }, ${
						origin.height / bounds.height
					} )`,
					opacity: 0.35,
				},
				{ transform: 'none', opacity: 1 },
			],
			{ duration: 200, easing: 'cubic-bezier( 0.22, 1, 0.36, 1 )' }
		);

		return () => animation.cancel();
	}, [ origin, isReducedMotion, isCentered ] );

	// Content fades in as you move between resources, but not on opening.
	const openedId = useRef( resource.id );
	const fadeClassName =
		resource.id !== openedId.current ? 'dashboard-resources-learn__modal-fade' : undefined;

	return (
		<Modal
			className="dashboard-resources-learn__modal"
			contentLabel={ resource.name }
			size="medium"
			onRequestClose={ onClose }
			onKeyDown={ ( event ) => {
				// Leave modified arrows, such as Alt+Arrow for history, to the browser.
				if (
					event.defaultPrevented ||
					event.altKey ||
					event.ctrlKey ||
					event.metaKey ||
					event.shiftKey
				) {
					return;
				}

				if ( event.key === previousKey ) {
					onPrevious?.();
				} else if ( event.key === nextKey ) {
					onNext?.();
				}
			} }
			// The preview leads the modal, with the navigation over it, so it draws its own header.
			__experimentalHideHeader
		>
			<VStack spacing={ 6 } ref={ contentRef }>
				<div className="dashboard-resources-learn__modal-media">
					{ /* Keyed so it fades in anew; the controls aren't, so focus stays on them. */ }
					<div key={ resource.id } className={ fadeClassName }>
						<ResourcePreview resource={ resource } onOpen={ onOpen } />
					</div>
					{ /* Not expanded: the insets set its width, which a 100% width would overflow. */ }
					<HStack
						justify="space-between"
						expanded={ false }
						className="dashboard-resources-learn__modal-controls"
					>
						<HStack
							spacing={ 0 }
							expanded={ false }
							className="dashboard-resources-learn__modal-navigation"
							role="group"
							aria-label={ __( 'Resource navigation' ) }
						>
							<Button
								icon={ previousIcon }
								label={ __( 'Previous resource' ) }
								size="compact"
								disabled={ ! onPrevious }
								accessibleWhenDisabled
								onClick={ onPrevious }
							/>
							<Button
								icon={ nextIcon }
								label={ __( 'Next resource' ) }
								size="compact"
								disabled={ ! onNext }
								accessibleWhenDisabled
								onClick={ onNext }
							/>
						</HStack>
						<Button
							className="dashboard-resources-learn__modal-close"
							icon={ closeSmall }
							label={ __( 'Close' ) }
							size="compact"
							onClick={ onClose }
						/>
					</HStack>
				</div>
				<VStack spacing={ 6 } key={ resource.id } className={ fadeClassName }>
					<VStack spacing={ 3 }>
						<Heading
							level={ 2 }
							size={ 32 }
							weight={ 600 }
							lineHeight={ 1.15 }
							className="dashboard-resources-learn__modal-title"
						>
							{ resource.name }
						</Heading>
						<Text size={ 15 } lineHeight={ 1.45 }>
							{ resource.description }
						</Text>
					</VStack>
					<ResourceBadges resource={ resource } onFilter={ onFilter } showFeatured />
					<HStack justify="space-between" wrap>
						<Button
							variant="primary"
							href={ resource.external_url }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ () => onOpen( resource ) }
							__next40pxDefaultSize
						>
							{ __( 'Open in new tab' ) }
						</Button>
						<Button
							variant="tertiary"
							icon={ isRead ? check : undefined }
							isPressed={ isRead }
							onClick={ onToggleRead }
							__next40pxDefaultSize
						>
							{ isRead ? __( 'Read' ) : __( 'Mark as read' ) }
						</Button>
					</HStack>
				</VStack>
			</VStack>
		</Modal>
	);
}
