import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import A4ASelectSiteModal from './modal';
import type { A4ASelectSiteProps } from './types';

const A4ASelectSite = ( {
	trackingEvent,
	buttonLabel,
	className,
	onSiteSelect,
	title,
	subtitle,
	selectedSiteId,
	isDisabled,
}: A4ASelectSiteProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isOpen, setIsOpen ] = useState( false );

	const handleOpenModal = useCallback( () => {
		setIsOpen( true );
		if ( trackingEvent ) {
			dispatch( recordTracksEvent( trackingEvent ) );
		}
	}, [ dispatch, trackingEvent ] );

	return (
		<>
			<Button
				disabled={ isDisabled }
				__next40pxDefaultSize
				variant="secondary"
				onClick={ handleOpenModal }
				className={ className }
				data-field="selectedSite"
			>
				{ buttonLabel || translate( 'Select a site' ) }
			</Button>
			{ isOpen && (
				<A4ASelectSiteModal
					onClose={ () => setIsOpen( false ) }
					onSiteSelect={ onSiteSelect }
					title={ title }
					subtitle={ subtitle }
					selectedSiteId={ selectedSiteId }
				/>
			) }
		</>
	);
};

export default A4ASelectSite;
