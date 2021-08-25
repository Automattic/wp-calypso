import { Button, Slot, SlotFillProvider } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

import './style.scss';

const BlankCanvas = ( { backUrl, children, onBackClick } ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		document.body.classList.add( 'has-blank-canvas' );
		dispatch( setLayoutFocus( 'content' ) );

		return () => document.body.classList.remove( 'has-blank-canvas' );
	}, [] );

	return (
		<SlotFillProvider>
			<div className="blank-canvas">
				<div className="blank-canvas__header">
					<WordPressLogo />
					{ ( backUrl || onBackClick ) && (
						<Button
							className="blank-canvas__back"
							href={ backUrl }
							icon={ chevronLeft }
							onClick={ onBackClick }
						>
							{ __( 'Back' ) }
						</Button>
					) }
				</div>
				<div className="blank-canvas__content">
					<Slot name="BlankCanvas.Content" />
					{ children }
				</div>
				<div className="blank-canvas__footer">
					<Slot name="BlankCanvas.Footer" />
				</div>
			</div>
		</SlotFillProvider>
	);
};

export { BlankCanvas };
