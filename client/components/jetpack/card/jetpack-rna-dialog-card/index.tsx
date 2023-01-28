import classNames from 'classnames';
import { ReactNode } from 'react';
import DefaultBackgroundImage from 'calypso/assets/images/jetpack/rna-card-bg.png';

import './style.scss';

interface RnaDialogCardProps {
	children?: ReactNode;
	cardImage?: string;
	isPlaceholder?: boolean;
}

const JetpackRnaDialogCard: React.FC< RnaDialogCardProps > = ( {
	children,
	cardImage,
	isPlaceholder,
} ) => {
	const cardDesktopSideImage = cardImage || DefaultBackgroundImage;
	return (
		<div
			className={ classNames( 'jetpack-rna-dialog-card', {
				'is-placeholder': isPlaceholder,
			} ) }
		>
			<div className="jetpack-rna-dialog-card__body">
				<div className="jetpack-rna-dialog-card__content">{ children && children }</div>
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
