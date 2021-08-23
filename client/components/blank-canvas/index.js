import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

import './style.scss';

export const BlankCanvas = ( { backUrl, children, onBackClick } ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		document.body.classList.add( 'has-blank-canvas' );
		dispatch( setLayoutFocus( 'content' ) );

		return () => document.body.classList.remove( 'has-blank-canvas' );
	}, [] );

	return (
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
			{ children }
		</div>
	);
};
