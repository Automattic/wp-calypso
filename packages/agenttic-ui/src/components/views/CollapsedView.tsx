import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { BigSkyIcon } from '../icons/BigSkyIcon';
import { motion } from 'framer-motion';
import { morphSpring } from '../animations';
import styles from './CollapsedView.module.css';
import { __ } from '@wordpress/i18n';

interface CollapsedViewProps {
	icon?: React.ReactNode;
	onClick: () => void;
	onHover: () => void;
	focusOnMount?: boolean;
}

export function CollapsedView( {
	icon = <BigSkyIcon className="size-6" />,
	onClick,
	onHover,
	focusOnMount = false,
}: CollapsedViewProps ) {
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
			data-slot="collapsed-view"
			layout="preserve-aspect"
			layoutId="collapsed-button"
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
				onMouseEnter={ onHover }
				variant="link"
				className={ styles.button }
				icon={ icon }
				aria-label={ __( 'Open chat', 'a8c-agenttic' ) }
			/>
		</motion.div>
	);
}
