/**
 * External dependencies
 */
import React, { FunctionComponent, ReactNode, isValidElement } from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { TranslateResult } from 'i18n-calypso';
import PromoCard, { Props as PromoCardProps } from './promo-card';
import PromoCardCta, { Props as PromoCardCtaProps } from './promo-card/cta';

export interface PromoSectionCardProps extends PromoCardProps {
	body: string | TranslateResult;
	actions?: PromoCardCtaProps | ReactNode;
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
	actions,
} ) => {
	const cta = get( actions, 'cta', null );
	const ctaNode = ! cta && isValidElement( actions ) ? actions : null;
	const learnMoreLink = get( actions, 'learnMoreLink', null );
	return (
		<PromoCard isPrimary={ !! isPrimary } title={ title } image={ image }>
			<p>{ body }</p>
			{ cta && <PromoCardCta cta={ cta } learnMoreLink={ learnMoreLink } /> }
			{ ctaNode }
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
