import PromoCard from './promo-card';
import PromoCardCta from './promo-card/cta';
import type { Props as PromoCardProps } from './promo-card';
import type { Props as PromoCardCtaProps } from './promo-card/cta';
import type { TranslateResult } from 'i18n-calypso';
import type { FunctionComponent } from 'react';

interface PromoSectionCardProps extends PromoCardProps {
	body: string | TranslateResult;
	actions?: PromoCardCtaProps;
}

export interface Props {
	header?: PromoSectionCardProps;
	launchpad?: PromoSectionCardProps | null;
	promos: PromoSectionCardProps[];
}

import './style.scss';

const PromoSectionCard: FunctionComponent< PromoSectionCardProps > = ( {
	isPrimary,
	isLaunchpad,
	title,
	image,
	icon,
	body,
	badge,
	actions,
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
			isLaunchpad={ !! isLaunchpad }
			title={ title }
			image={ image }
			badge={ badge }
			icon={ icon }
		>
			<p>{ body }</p>
			{ ctaComponent }
		</PromoCard>
	);
};

const PromoSection: FunctionComponent< Props > = ( { header, launchpad, promos } ) => {
	return (
		<div className="promo-section">
			{ launchpad && <PromoSectionCard isPrimary={ true } isLaunchpad={ true } { ...launchpad } /> }
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
