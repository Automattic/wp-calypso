import { speak } from '@wordpress/a11y';
import {
	Button,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { check, chevronLeft, chevronRight, closeSmall } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import ResourceBadges from './resource-badges';
import ResourcePreview from './resource-preview';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceModalProps {
	resource: AgencyEnablementResource;
	onClose: () => void;
	onPrevious?: () => void;
	onNext?: () => void;
	onOpen: ( resource: AgencyEnablementResource ) => void;
	isRead: boolean;
	onToggleRead: () => void;
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
	isRead,
	onToggleRead,
}: ResourceModalProps ) {
	// Previous points back along the reading direction, so it swaps in RTL.
	const [ previousKey, nextKey, previousIcon, nextIcon ] = isRTL()
		? ( [ 'ArrowRight', 'ArrowLeft', chevronRight, chevronLeft ] as const )
		: ( [ 'ArrowLeft', 'ArrowRight', chevronLeft, chevronRight ] as const );

	// Content fades in as you move between resources, but not on opening.
	const openedId = useRef( resource.id );
	const fadeClassName =
		resource.id !== openedId.current ? 'dashboard-resources-learn__modal-fade' : undefined;

	// Keyed by resource, so moving on resets the message.
	const [ copyResult, setCopyResult ] = useState< { id: number; copied: boolean } >();
	const copyResultTimeout = useRef< ReturnType< typeof setTimeout > >( undefined );
	useEffect( () => () => clearTimeout( copyResultTimeout.current ), [] );

	const showCopyResult = ( copied: boolean ) => {
		setCopyResult( { id: resource.id, copied } );
		speak( copied ? __( 'Link copied.' ) : __( 'Couldn’t copy the link.' ) );
		clearTimeout( copyResultTimeout.current );
		copyResultTimeout.current = setTimeout( () => setCopyResult( undefined ), 2000 );
	};

	const copyLink = async () => {
		try {
			// The same link the resource's card points to.
			await navigator.clipboard.writeText(
				new URL( `?resource=${ resource.id }`, window.location.href ).href
			);
			showCopyResult( true );
		} catch {
			showCopyResult( false );
		}
	};

	let copyLabel: string = __( 'Copy link' );
	if ( copyResult?.id === resource.id ) {
		copyLabel = copyResult.copied ? __( 'Link copied' ) : __( 'Couldn’t copy link' );
	}

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
			<VStack spacing={ 6 }>
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
								__next40pxDefaultSize
								size="compact"
								disabled={ ! onPrevious }
								accessibleWhenDisabled
								onClick={ onPrevious }
							/>
							<Button
								icon={ nextIcon }
								label={ __( 'Next resource' ) }
								__next40pxDefaultSize
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
							__next40pxDefaultSize
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
					<ResourceBadges resource={ resource } showFeatured />
					<HStack justify="space-between" wrap>
						<HStack spacing={ 2 } expanded={ false }>
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
							<Button variant="tertiary" onClick={ copyLink } __next40pxDefaultSize>
								{ copyLabel }
							</Button>
						</HStack>
						<Button
							variant="tertiary"
							icon={ isRead ? check : undefined }
							isPressed={ isRead }
							onClick={ onToggleRead }
							__next40pxDefaultSize
						>
							{ /* Wrap in span; avoids a Google Translate DOM crash (react/react#11538) */ }
							<span>{ isRead ? __( 'Read' ) : __( 'Mark as read' ) }</span>
						</Button>
					</HStack>
				</VStack>
			</VStack>
		</Modal>
	);
}
