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
	actions?: PromoCardCtaProps;
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
	icon,
	body,
	badge,
	actions,
} ) => {
	const cta = get( actions, 'cta', null );
	const learnMoreLink = get( actions, 'learnMoreLink', null );
	return (
		<PromoCard
			isPrimary={ !! isPrimary }
			title={ title }
			image={ image }
			badge={ badge }
			icon={ icon }
		>
			<p>{ body }</p>
			{ cta && ( cta.component || <PromoCardCta cta={ cta } learnMoreLink={ learnMoreLink } /> ) }
		</PromoCard>
	);
};

const PromoSection: FunctionComponent< Props > = ( { header, promos } ) => {
	return (
		<div className="promo-section">
			{ header && <PromoSectionCard isPrimary { ...header } /> }
			<div className="promo-section__promos">
				{ promos.map( ( promo, i ) => (
					<PromoSectionCard { ...promo } key={ i } />
				) ) }
			</div>
		</div>
	);
};

export default PromoSection;
