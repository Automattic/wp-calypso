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
	isLoading: boolean;
	actions?: PromoCardCtaProps;
}

export interface Props {
	header?: PromoSectionCardProps;
	isLoading: boolean;
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
	badge,
	actions,
	isLoading,
} ) => {
	const cta = get( actions, 'cta', null );
	const learnMoreLink = get( actions, 'learnMoreLink', null );
	return (
		<PromoCard
			isLoading={ isLoading }
			isPrimary={ !! isPrimary }
			title={ title }
			image={ image }
			badge={ badge }
		>
			<p>{ body }</p>
			{ cta && ( cta.component || <PromoCardCta cta={ cta } learnMoreLink={ learnMoreLink } /> ) }
		</PromoCard>
	);
};

const PromoSection: FunctionComponent< Props > = ( { header, isLoading, promos } ) => {
	return (
		<div className="promo-section">
			{ header && <PromoSectionCard isPrimary={ true } { ...header } /> }
			<div className="promo-section__promos">
				{ promos.map( ( promo, i ) => (
					<PromoSectionCard { ...promo } isLoading={ isLoading } key={ i } />
				) ) }
			</div>
		</div>
	);
};

export default PromoSection;
