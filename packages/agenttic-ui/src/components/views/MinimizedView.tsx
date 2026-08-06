import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { BigSkyIcon } from '../icons/BigSkyIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { motion } from 'framer-motion';
import { morphSpring } from '../animations';
import { __ } from '@wordpress/i18n';
import styles from './MinimizedView.module.css';

interface MinimizedViewProps {
	icon?: React.ReactNode;
	title?: string;
	onClick: () => void;
	focusOnMount?: boolean;
}

export function MinimizedView( {
	icon = <BigSkyIcon size={ 26 } />,
	title = __( 'Ask AI', 'a8c-agenttic' ),
	onClick,
	focusOnMount = false,
}: MinimizedViewProps ) {
	const buttonRef = useRef< HTMLButtonElement >( null );

	// Set ref value on mount to prevent focus on mount from being triggered again
	const focusOnMountRef = useRef( focusOnMount );

	useEffect( () => {
		if ( focusOnMountRef.current && buttonRef.current ) {
			buttonRef.current.focus();
		}

		// Reset ref value to prevent focus on mount from being triggered again
		focusOnMountRef.current = false;
	}, [ focusOnMountRef, buttonRef ] );

	return (
		<motion.div
			data-slot="minimized-view"
			layout="preserve-aspect"
			layoutId="minimized-bar"
			initial={ {
				opacity: 0,
				scale: 0.5,
			} }
			animate={ {
				opacity: 1,
				scale: 1,
				transition: {
					...morphSpring,
					delay: 0.2,
				},
			} }
			exit={ {
				opacity: 0,
				scale: 0,
				transition: {
					duration: 0.15,
				},
			} }
		>
			<Button
				ref={ buttonRef }
				onClick={ onClick }
				variant="ghost"
				className={ styles.button }
				icon={ icon }
				aria-label={ title || __( 'Open chat', 'a8c-agenttic' ) }
			>
				{ /* Always render the title slot so the icon keeps the same
				     left-aligned layout whether or not a title is set. */ }
				<span className={ styles.title }>{ title }</span>
				<ChevronUpIcon className={ styles.chevron } />
			</Button>
		</motion.div>
	);
}
