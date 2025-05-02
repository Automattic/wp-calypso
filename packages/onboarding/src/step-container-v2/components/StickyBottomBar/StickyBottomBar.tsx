import { ReactNode } from 'react';
import styles from './style.module.scss';

interface StickyBottomBarProps {
	leftElement?: ReactNode;
	centerElement?: ReactNode;
	rightElement?: ReactNode;
}

export const StickyBottomBar = ( {
	leftElement,
	centerElement,
	rightElement,
}: StickyBottomBarProps ) => {
	return (
		<div className={ styles[ 'step-container-v2__sticky-bottom-bar' ] }>
			{ leftElement && (
				<div className={ styles[ 'step-container-v2__sticky-bottom-bar-left-element' ] }>
					{ leftElement }
				</div>
			) }
			{ centerElement && (
				<div className={ styles[ 'step-container-v2__sticky-bottom-bar-center-element' ] }>
					{ centerElement }
				</div>
			) }
			{ rightElement && (
				<div className={ styles[ 'step-container-v2__sticky-bottom-bar-right-element' ] }>
					{ rightElement }
				</div>
			) }
		</div>
	);
};
