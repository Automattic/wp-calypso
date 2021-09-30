import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

import './style.scss';

const BlankCanvas = ( { className, children } ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		document.body.classList.add( 'has-blank-canvas' );
		dispatch( setLayoutFocus( 'content' ) );

		return () => document.body.classList.remove( 'has-blank-canvas' );
	}, [] );

	return ReactDOM.createPortal(
		<div className={ `blank-canvas ${ className }` }>{ children }</div>,
		document.body
	);
};

BlankCanvas.Header = ( { backUrl, children, onBackClick } ) => (
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
		{ children.length && <div className="blank-canvas__header-title">{ children }</div> }
	</div>
);
BlankCanvas.Content = ( { children } ) => <div className="blank-canvas__content">{ children }</div>;
BlankCanvas.Footer = ( { children } ) => <div className="blank-canvas__footer">{ children }</div>;

export { BlankCanvas };
