import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SelectSiteModal from './modal';

export type SelectSiteButtonProps = {
	onSiteSelect: ( siteId: number, siteDomain: string ) => void;
	buttonLabel?: string;
	modalTitle?: string;
	modalSubtitle?: string;
	trackingEvent?: string;
	className?: string;
};

const SelectSiteButton = ( {
	onSiteSelect,
	buttonLabel,
	modalTitle,
	modalSubtitle,
	trackingEvent = 'calypso_select_site_button_click',
	className,
}: SelectSiteButtonProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isOpen, setIsOpen ] = useState( false );

	const handleOpenModal = useCallback( () => {
		setIsOpen( true );
		dispatch( recordTracksEvent( trackingEvent ) );
	}, [ dispatch, trackingEvent ] );

	return (
		<>
			<Button
				__next40pxDefaultSize
				variant="secondary"
				onClick={ handleOpenModal }
				className={ className }
			>
				{ buttonLabel || translate( 'Select a site' ) }
			</Button>

			{ isOpen && (
				<SelectSiteModal
					onClose={ () => setIsOpen( false ) }
					onSiteSelect={ onSiteSelect }
					title={ modalTitle }
					subtitle={ modalSubtitle }
				/>
			) }
		</>
	);
};

export default SelectSiteButton;
