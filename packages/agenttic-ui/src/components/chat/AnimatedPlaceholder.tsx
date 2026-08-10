import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/classNames';
import styles from './AnimatedPlaceholder.module.css';

interface AnimatedPlaceholderProps {
	texts: string[];
	interval?: number;
	className?: string;
}

export function AnimatedPlaceholder( {
	texts,
	interval = 3000,
	className = '',
}: AnimatedPlaceholderProps ) {
	const [ currentIndex, setCurrentIndex ] = useState( 0 );

	useEffect( () => {
		const intervalId = setInterval( () => {
			setCurrentIndex(
				( prevIndex ) => ( prevIndex + 1 ) % texts.length
			);
		}, interval );

		return () => clearInterval( intervalId );
	}, [ texts.length, interval ] );

	return (
		<AnimatePresence mode="wait">
			<motion.span
				key={ currentIndex }
				data-slot="animated-placeholder"
				className={ cn( styles.container, className ) }
				initial={ { opacity: 0, y: 8 } }
				animate={ { opacity: 1, y: 0 } }
				exit={ { opacity: 0, y: -8 } }
				transition={ {
					duration: 0.3,
					ease: [ 0.4, 0, 0.2, 1 ], // Matches --transition-colors cubic-bezier
				} }
			>
				{ texts[ currentIndex ] }
			</motion.span>
		</AnimatePresence>
	);
}
