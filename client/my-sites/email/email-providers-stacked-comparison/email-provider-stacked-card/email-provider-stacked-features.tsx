import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, MouseEventHandler } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

export interface EmailProviderStackedFeatureProps {
	title: TranslateResult;
}

const EmailProviderStackedFeature: FunctionComponent< EmailProviderStackedFeatureProps > = (
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

export const EmailProviderStackedFeatures: FunctionComponent< EmailProviderStackedFeaturesProps > = (
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

export const EmailProviderStackedFeaturesToggleButton: FunctionComponent< EmailProviderStackedFeaturesToggleButton > = (
	props
) => {
	const translate = useTranslate();
	const { handleClick, isRelatedContentExpanded } = props;

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus
		<span
			role="button"
			className="email-provider-stacked-features__toggle-button"
			onClick={ handleClick }
		>
			<span className="email-provider-stacked-features__toggle-text">
				{ translate( 'Show all features' ) }
			</span>

			<Gridicon icon={ isRelatedContentExpanded ? 'chevron-up' : 'chevron-down' } />
		</span>
	);
};

interface EmailProviderStackedFeaturesToggleButton {
	handleClick: MouseEventHandler< HTMLButtonElement >;
	isRelatedContentExpanded: boolean;
}
