import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import { MouseEventHandler, PropsWithChildren, ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

import './style.scss';

interface Props {
	className?: string;
	children: ReactNode;
}
const BlankCanvas = ( { className = '', children }: Props ) => {
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
BlankCanvas.Header = ( {
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

BlankCanvas.Content = ( { children }: PropsWithChildren ) => (
	<div className="blank-canvas__content">{ children }</div>
);

BlankCanvas.Footer = ( { children }: PropsWithChildren ) => (
	<div className="blank-canvas__footer">{ children }</div>
);

export { BlankCanvas };
