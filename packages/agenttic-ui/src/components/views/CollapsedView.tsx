import React from 'react';
import { Button } from '../ui/button';
import { BigSkyIcon } from '../icons/BigSkyIcon';
import { motion } from 'framer-motion';
import { morphSpring } from '../animations';
import styles from './CollapsedView.module.css';

interface CollapsedViewProps {
	icon?: React.ReactNode;
	onClick: () => void;
	onHover: () => void;
	fromExpanded?: boolean;
}

export function CollapsedView( {
	icon = <BigSkyIcon className="size-6" />,
	onClick,
	onHover,
	fromExpanded = false,
}: CollapsedViewProps ) {
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
				onClick={ onClick }
				onMouseEnter={ onHover }
				variant="link"
				className={ styles.button }
				icon={ icon }
			/>
		</motion.div>
	);
}
