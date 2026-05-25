import {
	__unstableAnimatePresence as AnimatePresence,
	__unstableMotion as motion,
} from '@wordpress/components';
import './style.scss';

interface FooterProps {
	message?: string;
	chatComponent?: React.ReactNode;
}

export const Footer = ( { message, chatComponent }: FooterProps ) => {
	const content = message ? (
		<p className="image-studio-footer__notice" aria-hidden="true">
			{ message }
		</p>
	) : (
		chatComponent
	);

	return (
		<div className="image-studio-footer">
			<div role="status" aria-live="polite" className="image-studio-sr-only">
				{ message }
			</div>

			<AnimatePresence mode="wait">
				<motion.div
					key={ message ? 'message' : 'chat' }
					className="image-studio-footer__inner"
					initial={ { opacity: 0 } }
					animate={ {
						opacity: 1,
						visibility: 'visible',
					} }
					exit={ { opacity: 0 } }
					transition={ {
						duration: 0.3,
						ease: 'easeInOut',
					} }
				>
					{ content }
				</motion.div>
			</AnimatePresence>
		</div>
	);
};
