import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import UpsellBackgroundImage from 'calypso/assets/images/jetpack/rna-card-bg.png';
import DefaultImage from 'calypso/assets/images/jetpack/rna-image-default.png';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

interface RnaActionCardProps {
	headerText: TranslateResult;
	subHeaderText?: TranslateResult | ReactNode;
	children?: ReactNode;
	onCtaButtonClick?: () => void;
	ctaButtonURL?: string;
	ctaButtonLabel: TranslateResult;
	ctaTracksEvent?: string;
	cardImage?: string;
	cardImageAlt?: string;
	isPlaceholder?: boolean;
	secondaryCtaURL?: string;
	secondaryCtaLabel?: string;
	secondaryCtaTracksEvent?: string;
}

const JetpackRnaActionCard: React.FC< RnaActionCardProps > = ( {
	headerText,
	subHeaderText,
	children,
	onCtaButtonClick,
	ctaButtonURL,
	ctaButtonLabel,
	ctaTracksEvent,
	cardImage = DefaultImage,
	cardImageAlt,
	isPlaceholder,
	secondaryCtaURL,
	secondaryCtaLabel,
	secondaryCtaTracksEvent,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const handleCtaButtonClick = () => {
		if ( ctaTracksEvent ) {
			dispatch( recordTracksEvent( ctaTracksEvent ) );
		}
		if ( onCtaButtonClick ) {
			onCtaButtonClick();
		}
	};
	const handleSecondaryCtaButtonClick = () => {
		if ( secondaryCtaTracksEvent ) {
			dispatch( recordTracksEvent( secondaryCtaTracksEvent ) );
		}
	};
	return (
		<div
			className={ clsx( 'jetpack-rna-action-card', {
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
						onClick={ handleCtaButtonClick }
						href={ ctaButtonURL ? ctaButtonURL : '#' }
						disabled={ ! ctaButtonURL }
					>
						{ ctaButtonLabel }
					</Button>
					{ secondaryCtaURL && (
						<div className="jetpack-rna-action-card__secondary-cta">
							<a href={ secondaryCtaURL } onClick={ handleSecondaryCtaButtonClick }>
								{ secondaryCtaLabel }
							</a>
						</div>
					) }
				</div>
			</div>
			<div className="jetpack-rna-action-card__footer">
				<div className="jetpack-rna-action-card__footer-image">
					{ isPlaceholder ? (
						<div className="jetpack-rna-action-card__placeholder-image"></div>
					) : (
						<img
							src={ cardImage }
							alt={ cardImageAlt ? cardImageAlt : translate( 'Jetpack', { textOnly: true } ) }
						/>
					) }
				</div>
			</div>
		</div>
	);
};

export default JetpackRnaActionCard;
