import PromoCard from './promo-card';
import PromoCardCta from './promo-card/cta';
import type { Props as PromoCardProps } from './promo-card';
import type { Props as PromoCardCtaProps } from './promo-card/cta';
import type { TranslateResult } from 'i18n-calypso';
import type { FunctionComponent } from 'react';

export interface PromoSectionCardProps extends PromoCardProps {
	body: string | TranslateResult;
	actions?: PromoCardCtaProps;
}

export interface Props {
	header?: PromoSectionCardProps;
	promos: PromoSectionCardProps[];
}

import './style.scss';

const PromoSectionCard: FunctionComponent< PromoSectionCardProps > = ( {
	isPrimary,
	title,
	image,
	icon,
	body,
	badge,
	actions,
	variation,
} ) => {
	const cta = actions?.cta;
	const learnMoreLink = actions?.learnMoreLink;
	const getCtaComponent = () => {
		if ( ! cta ) {
			return null;
		}
		if ( 'component' in cta && cta.component ) {
			return cta.component;
		}
		return <PromoCardCta cta={ cta } learnMoreLink={ learnMoreLink } />;
	};
	const ctaComponent = getCtaComponent();
	return (
		<PromoCard
			isPrimary={ !! isPrimary }
			title={ title }
			image={ image }
			badge={ badge }
			icon={ icon }
			variation={ variation }
		>
			<p>{ body }</p>
			{ ctaComponent }
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
