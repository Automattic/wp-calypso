import clsx from 'clsx';
import { ReactNode } from 'react';
import DefaultBackgroundImage from 'calypso/assets/images/jetpack/rna-card-bg.png';

import './style.scss';

interface RnaDialogCardProps {
	children: ReactNode;
	cardImage?: string;
	cardImage2xRetina?: string;
	isPlaceholder?: boolean;
}

const JetpackRnaDialogCard: React.FC< RnaDialogCardProps > = ( {
	children,
	cardImage,
	cardImage2xRetina,
	isPlaceholder,
} ) => {
	const cardDesktopSideImage =
		window.devicePixelRatio > 1 && cardImage2xRetina
			? cardImage2xRetina
			: cardImage ?? DefaultBackgroundImage;
	return (
		<div
			className={ clsx( 'jetpack-rna-dialog-card', {
				'is-placeholder': isPlaceholder,
			} ) }
		>
			<div className="jetpack-rna-dialog-card__body">
				<div className="jetpack-rna-dialog-card__content">{ children }</div>
			</div>
			<div
				className="jetpack-rna-dialog-card__footer"
				{ ...( ! isPlaceholder && {
					style: { backgroundImage: `url(${ cardDesktopSideImage })` },
				} ) }
			></div>
		</div>
	);
};

export default JetpackRnaDialogCard;
