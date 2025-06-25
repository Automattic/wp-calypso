import { WordPressLogo } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import { MouseEventHandler, PropsWithChildren, ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

import './style.scss';

interface Props {
	className?: string;
	children: ReactNode;
}
const BlankCanvasComponent = ( { className = '', children }: Props ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		document.documentElement.classList.add( 'has-blank-canvas' );
		dispatch( setLayoutFocus( 'content' ) );

		return () => document.documentElement.classList.remove( 'has-blank-canvas' );
	}, [] );

	return ReactDOM.createPortal(
		<div className={ `blank-canvas ${ className }` }>{ children }</div>,
		document.body
	);
};

interface HeaderProps {
	className?: string;
	backUrl?: string;
	onBackClick?: MouseEventHandler;
}
const BlankCanvasHeader = ( {
	className = '',
	backUrl,
	children,
	onBackClick,
}: PropsWithChildren< HeaderProps > ) => (
	<div className={ `blank-canvas__header ${ className }` }>
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
		{ children && <div className="blank-canvas__header-title">{ children }</div> }
	</div>
);

const BlankCanvasContent = ( { children }: PropsWithChildren ) => (
	<div className="blank-canvas__content">{ children }</div>
);

const BlankCanvasFooter = ( { children }: PropsWithChildren ) => (
	<div className="blank-canvas__footer">{ children }</div>
);

const BlankCanvas = Object.assign( BlankCanvasComponent, {
	Header: Object.assign( BlankCanvasHeader, { displayName: 'BlankCanvas.Header' } ),
	Content: Object.assign( BlankCanvasContent, { displayName: 'BlankCanvas.Content' } ),
	Footer: Object.assign( BlankCanvasFooter, { displayName: 'BlankCanvas.Footer' } ),
} );

export { BlankCanvas };
