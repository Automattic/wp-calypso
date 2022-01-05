import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement, MouseEventHandler } from 'react';

import './style.scss';

export interface EmailProviderStackedFeatureProps {
	title: TranslateResult;
}

const EmailProviderStackedFeature: ReactElement< EmailProviderStackedFeatureProps > | null = (
	props
) => {
	const { title } = props;
	const size = 18;
	return (
		<div className="email-provider-stacked-features__feature">
			<Gridicon icon="checkmark" size={ size } />

			{ preventWidows( title ) }
		</div>
	);
};

export interface EmailProviderStackedFeaturesProps {
	features: TranslateResult[];
}

export const EmailProviderStackedFeatures: ReactElement< EmailProviderStackedFeaturesProps > | null = (
	props
) => {
	const { features } = props;
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
		</>
	);
};

interface EmailProviderStackedFeaturesToggleButtonProps {
	handleClick: MouseEventHandler< HTMLButtonElement >;
	isRelatedContentExpanded: boolean;
}

export const EmailProviderStackedFeaturesToggleButton: ReactElement< EmailProviderStackedFeaturesToggleButtonProps > | null = ( {
	handleClick,
	isRelatedContentExpanded,
} ) => {
	const translate = useTranslate();

	return (
		<Button
			borderless
			className="email-provider-stacked-features__toggle-button"
			onClick={ handleClick }
		>
			<span className="email-provider-stacked-features__toggle-text">
				{ translate( 'Show all features' ) }
			</span>

			<Gridicon icon={ isRelatedContentExpanded ? 'chevron-up' : 'chevron-down' } />
		</Button>
	);
};
