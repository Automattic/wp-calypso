import { useCallback, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import A4ASelectSiteButton from './button';
import A4ASelectSiteModal from './modal';
import type { A4ASelectSiteProps } from './types';

const A4ASelectSite = ( {
	trackingEvent,
	buttonLabel,
	className,
	onSiteSelect,
	title,
	subtitle,
}: A4ASelectSiteProps ) => {
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
			<A4ASelectSiteButton
				handleOpenModal={ handleOpenModal }
				buttonLabel={ buttonLabel }
				className={ className }
			/>
			{ isOpen && (
				<A4ASelectSiteModal
					onClose={ () => setIsOpen( false ) }
					onSiteSelect={ onSiteSelect }
					title={ title }
					subtitle={ subtitle }
				/>
			) }
		</>
	);
};

A4ASelectSite.Button = A4ASelectSiteButton;
A4ASelectSite.Modal = A4ASelectSiteModal;

export default A4ASelectSite;
