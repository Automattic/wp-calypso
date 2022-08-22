import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';
import type { TranslateResult } from 'i18n-calypso';
import type { MouseEventHandler, ReactElement } from 'react';

import './style.scss';

export interface EmailProviderStackedFeatureProps {
	title: TranslateResult;
}

const EmailProviderStackedFeature = ( {
	title,
}: EmailProviderStackedFeatureProps ): ReactElement => {
	const size = 18;
	return (
		<div className="email-provider-stacked-features__feature">
			<Gridicon icon="checkmark" size={ size } />

			{ preventWidows( title ) }
		</div>
	);
};

export interface AppLogo {
	image: string;
	imageAltText: string;
	title: string;
}

export interface EmailProviderStackedFeaturesProps {
	features: TranslateResult[];
	appLogos: AppLogo[];
}

export const EmailProviderStackedFeatures = ( {
	features,
	appLogos,
}: EmailProviderStackedFeaturesProps ): ReactElement | null => {
	const translate = useTranslate();

	if ( ! features ) {
		return null;
	}

	return (
		<>
			<span className={ 'email-provider-stacked-features__whats-included' }>
				{ translate( "What's included:" ) }
			</span>

			{ features.map( ( feature, index ) => (
				<EmailProviderStackedFeature key={ index } title={ feature } />
			) ) }

			{ appLogos && (
				<div className="email-provider-stacked-features__logos">
					{ appLogos.map( ( { image, imageAltText, title }, index ) => (
						<img alt={ imageAltText } key={ index } src={ image } title={ title } />
					) ) }
				</div>
			) }
		</>
	);
};

interface EmailProviderStackedFeaturesToggleButtonProps {
	handleClick: MouseEventHandler< HTMLButtonElement >;
	isRelatedContentExpanded: boolean;
}

export const EmailProviderStackedFeaturesToggleButton = ( {
	handleClick,
	isRelatedContentExpanded,
}: EmailProviderStackedFeaturesToggleButtonProps ): ReactElement => {
	const translate = useTranslate();

	return (
		<Button
			borderless
			className="email-provider-stacked-features__toggle-button"
			onClick={ handleClick }
		>
			<span className="email-provider-stacked-features__toggle-text">
				{ isRelatedContentExpanded
					? translate( 'Hide all features' )
					: translate( 'Show all features' ) }
			</span>

			<Gridicon icon={ isRelatedContentExpanded ? 'chevron-up' : 'chevron-down' } />
		</Button>
	);
};
