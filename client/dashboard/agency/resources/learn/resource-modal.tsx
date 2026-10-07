import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import ResourceBadges from './resource-badges';
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
			title={ resource.name }
			size="medium"
			onRequestClose={ onClose }
			onKeyDown={ ( event ) => {
				if ( event.key === previousKey ) {
					onPrevious?.();
				} else if ( event.key === nextKey ) {
					onNext?.();
				}
			} }
			headerActions={
				<>
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
				</>
			}
		>
			<VStack spacing={ 6 }>
				<VStack spacing={ 4 }>
					<Text>{ resource.description }</Text>
					<ResourceBadges resource={ resource } onFilter={ onFilter } />
				</VStack>
				<HStack justify="flex-start">
					<Button
						variant="primary"
						href={ resource.external_url }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => onOpen( resource ) }
						__next40pxDefaultSize
					>
						{ __( 'Open resource' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
