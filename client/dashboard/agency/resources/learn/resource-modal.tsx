import {
	Button,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight, closeSmall } from '@wordpress/icons';
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
}: ResourceModalProps ) {
	const [ previousKey, nextKey ] = isRTL()
		? [ 'ArrowRight', 'ArrowLeft' ]
		: [ 'ArrowLeft', 'ArrowRight' ];

	return (
		<Modal
			className="dashboard-resources-learn__modal"
			contentLabel={ resource.name }
			size="medium"
			onRequestClose={ onClose }
			onKeyDown={ ( event ) => {
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
					<ResourcePreview key={ resource.id } resource={ resource } onOpen={ onOpen } />
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
								icon={ isRTL() ? chevronRight : chevronLeft }
								label={ __( 'Previous resource' ) }
								size="compact"
								disabled={ ! onPrevious }
								accessibleWhenDisabled
								onClick={ onPrevious }
							/>
							<Button
								icon={ isRTL() ? chevronLeft : chevronRight }
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
				<VStack spacing={ 6 }>
					<VStack spacing={ 3 }>
						<Heading
							level={ 1 }
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
					<ResourceBadges resource={ resource } onFilter={ onFilter } />
					<HStack justify="flex-start">
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
					</HStack>
				</VStack>
			</VStack>
		</Modal>
	);
}
