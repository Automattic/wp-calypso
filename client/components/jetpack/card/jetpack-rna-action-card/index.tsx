import { Button, Card } from '@automattic/components';
import classNames from 'classnames';
import { TranslateResult } from 'i18n-calypso';
import { ReactNode } from 'react';
import UpsellBackgroundImage from 'calypso/assets/images/jetpack/rna-card-bg.png';
import DefaultImage from 'calypso/assets/images/jetpack/rna-image-default.png';

import './style.scss';

interface RnaActionCardProps {
	headerText: TranslateResult;
	subHeaderText?: TranslateResult | ReactNode;
	children?: ReactNode;
	onCtaButtonClick?: () => void;
	ctaButtonURL?: string;
	ctaButtonLabel: TranslateResult;
	cardImage?: string;
	cardImageAlt?: string | TranslateResult;
	isPlaceholder?: boolean;
}

const JetpackRnaActionCard: React.FC< RnaActionCardProps > = ( {
	headerText,
	subHeaderText,
	children,
	onCtaButtonClick,
	ctaButtonURL,
	ctaButtonLabel,
	cardImage = DefaultImage,
	cardImageAlt,
	isPlaceholder,
} ) => {
	return (
		<Card
			className={ classNames( 'jetpack-rna-action-card', {
				'is-placeholder': isPlaceholder,
			} ) }
			{ ...( ! isPlaceholder && {
				style: { backgroundImage: `url(${ UpsellBackgroundImage })` },
			} ) }
		>
			<div className="jetpack-rna-action-card__body">
				<div className="jetpack-rna-action-card__content">
					<h2 className="jetpack-rna-action-card__header">{ headerText }</h2>
					{ subHeaderText && (
						<p className="jetpack-rna-action-card__description">{ subHeaderText }</p>
					) }

					{ children && children }
				</div>
				<div className="jetpack-rna-action-card__action">
					<Button
						primary
						className="jetpack-rna-action-card__button"
						onClick={ onCtaButtonClick && onCtaButtonClick }
						href={ ctaButtonURL ? ctaButtonURL : '#' }
						disabled={ ! ctaButtonURL }
					>
						{ ctaButtonLabel }
					</Button>
				</div>
			</div>
			<div className="jetpack-rna-action-card__footer">
				<div className="jetpack-rna-action-card__footer-image">
					{ isPlaceholder ? (
						<div className="jetpack-rna-action-card__placeholder-image"></div>
					) : (
						<img src={ cardImage } alt={ ( cardImageAlt ? cardImageAlt : 'Jetpack ' ) as string } />
					) }
				</div>
			</div>
		</Card>
	);
};

export default JetpackRnaActionCard;
