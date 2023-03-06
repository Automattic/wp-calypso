import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Card } from '@automattic/components';
import { useCallback, useMemo } from 'react';
import type { GetFeatureHrefProps, IncludedFeatures } from '../ecommerce-trial/trial-features';

import './style.scss';

interface FeatureIncludedCardProps extends IncludedFeatures, GetFeatureHrefProps {}

const FeatureIncludedCard = ( {
	buttonText,
	getHref,
	id,
	illustration,
	onButtonClick,
	showButton,
	siteSlug,
	text,
	title,
	wpAdminUrl,
}: FeatureIncludedCardProps ) => {
	const onCardLinkClick = useCallback( () => {
		if ( ! showButton ) {
			return;
		}

		recordTracksEvent( 'calypso_wooexpress_included_feature_cta_clicked', { feature: id } );

		onButtonClick?.();
	}, [ id, onButtonClick, showButton ] );

	const cardLinkHref = useMemo( () => {
		if ( ! showButton || ! getHref ) {
			return '';
		}

		return getHref( { siteSlug, wpAdminUrl } );
	}, [ id, getHref, showButton, siteSlug, wpAdminUrl ] );

	return (
		<Card className="feature-included-card__card">
			<img
				className="feature-included-card__illustration"
				alt={ String( title ) }
				src={ illustration }
			/>
			<div className="feature-included-card__content">
				<p className="feature-included-card__title">{ title }</p>
				<p className="feature-included-card__text">{ text }</p>
				{ showButton && (
					<Button
						className="feature-included-card__link"
						href={ cardLinkHref }
						onClick={ onCardLinkClick }
					>
						{ buttonText }
					</Button>
				) }
			</div>
		</Card>
	);
};

export default FeatureIncludedCard;
