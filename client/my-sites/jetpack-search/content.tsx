/**
 * External dependencies
 */
import React, { FunctionComponent, ReactNode, Fragment } from 'react';
import { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import JetpackUpsell from 'calypso/components/jetpack/upsell';
import FormattedHeader from 'calypso/components/formatted-header';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';

interface Props {
	bodyText: TranslateResult | ReactNode;
	buttonLink?: TranslateResult;
	buttonText?: TranslateResult;
	headerText: TranslateResult;
	iconComponent?: ReactNode;
	onClick?: () => void;
}

const JetpackSearchContent: FunctionComponent< Props > = ( {
	bodyText,
	buttonLink,
	buttonText,
	headerText,
	iconComponent,
	onClick,
} ) => {
	const isCloud = isJetpackCloud();
	const translate = useTranslate();

	// Jetpack Cloud uses the Upsell component to render content
	if ( isCloud ) {
		return (
			<JetpackUpsell
				headerText={ headerText }
				bodyText={ bodyText }
				buttonLink={ buttonLink }
				buttonText={ buttonText }
				onClick={ onClick }
				iconComponent={ iconComponent }
			/>
		);
	}

	return (
		<Fragment>
			<FormattedHeader
				headerText={ translate( 'Jetpack Search' ) }
				id="jetpack-search-header"
				align="left"
				brandFont
			/>
			<PromoCard title={ headerText } image={ iconComponent } isPrimary>
				<p className="jetpack-search__content-body-text">{ bodyText }</p>

				<PromoCardCTA
					cta={ {
						text: buttonText,
						action: {
							url: buttonLink,
							onClick: onClick ? onClick : null,
							selfTarget: true,
						},
					} }
				/>
			</PromoCard>
		</Fragment>
	);
};

export default JetpackSearchContent;
