import clsx from 'clsx';
import { createContext, useContext, type ReactNode } from 'react';
import styles from './style.module.scss';

const ContentWrapperContext = createContext( false );

export const useIsContentWrapperContext = () => useContext( ContentWrapperContext );

export const ContentWrapper = ( {
	children,
	centerAligned,
}: {
	children: ReactNode;
	centerAligned?: boolean;
} ) => {
	return (
		<ContentWrapperContext.Provider value>
			<div
				className={ clsx( styles[ 'step-container-v2__content-wrapper' ], {
					[ styles[ 'center-aligned' ] ]: centerAligned,
				} ) }
			>
				{ children }
			</div>
		</ContentWrapperContext.Provider>
	);
};
