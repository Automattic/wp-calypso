/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { TranslateResult } from 'i18n-calypso';
import PromoCard, { Props as PromoCardProps } from './promo-card';
import PromoCardCta, { Props as PromoCardCtaProps } from './promo-card/cta';

interface PromoSectionCardProps extends PromoCardProps {
	body: string | TranslateResult;
	ctaProps?: PromoCardCtaProps;
}

export interface Props {
	header?: PromoSectionCardProps;
	promos: PromoSectionCardProps[];
}

/**
 * Style dependencies
 */
import './style.scss';

const PromoSectionCard: FunctionComponent< PromoSectionCardProps > = ( {
	isPrimary,
	title,
	image,
	body,
	ctaProps,
} ) => {
	const cta = get( ctaProps, 'cta', null );
	const learnMoreLink = get( ctaProps, 'learnMoreLink', null );
	return (
		<PromoCard isPrimary={ !! isPrimary } title={ title } image={ image }>
			<p>{ body }</p>
			{ cta && <PromoCardCta cta={ cta } learnMoreLink={ learnMoreLink } /> }
		</PromoCard>
	);
};

const PromoSection: FunctionComponent< Props > = ( { header, promos } ) => {
	return (
		<div className="promo-section">
			{ header && <PromoSectionCard isPrimary={ true } { ...header } /> }
			<div className="promo-section__promos">
				{ promos.map( ( promo, i ) => (
					<PromoSectionCard { ...promo } key={ i } />
				) ) }
			</div>
		</div>
	);
};

export default PromoSection;
