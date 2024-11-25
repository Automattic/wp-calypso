import clsx from 'clsx';
import { RefObject, createContext, useContext, useRef } from 'react';

import './style.scss';

interface MainProps {
	ariaLabel?: string;
	children: React.ReactNode;
	className?: string;
	fullWidthLayout?: boolean;
	id?: string;
	isLoggedOut?: boolean;
	wideLayout?: boolean;
}

interface MainRefContextInterface {
	mainRef: RefObject< HTMLElement > | undefined;
}

export const MainRefContext = createContext< MainRefContextInterface >( {
	mainRef: undefined,
} );

export const useMainContext = () => useContext( MainRefContext );

export default function Main( {
	className = '',
	id = '',
	children,
	wideLayout = false,
	fullWidthLayout = false,
	isLoggedOut = false,
	ariaLabel,
}: MainProps ) {
	const ref = useRef( null );
	const classes = clsx( className, 'main', {
		'is-wide-layout': wideLayout,
		'is-full-width-layout': fullWidthLayout,
		'is-logged-out': isLoggedOut,
	} );

	return (
		<MainRefContext.Provider value={ { mainRef: ref } }>
			<main
				ref={ ref }
				className={ classes }
				id={ id || undefined }
				role="main"
				aria-label={ ariaLabel }
			>
				{ children }
			</main>
		</MainRefContext.Provider>
	);
}
