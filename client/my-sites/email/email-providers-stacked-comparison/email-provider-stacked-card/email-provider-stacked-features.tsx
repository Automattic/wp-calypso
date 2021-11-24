import { Gridicon } from '@automattic/components';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactElement } from 'react';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

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

export interface EmailProviderStackedFeatureProps {
	title: TranslateResult;
}

const EmailProviderStackedFeatures: FunctionComponent< EmailProviderStackedFeaturesProps > = (
	props
) => {
	const { features, badge = null } = props;
	const translate = useTranslate();

	if ( ! features ) {
		return null;
	}

	return (
		<div className="email-provider-stacked-features">
			<span className={ 'email-provider-stacked-features__whats-included' }>
				{ translate( "What's included:" ) }
			</span>
			{ features.map( ( feature, index ) => (
				<EmailProviderStackedFeature key={ index } title={ feature } />
			) ) }
			{ badge }
		</div>
	);
};

export interface EmailProviderStackedFeaturesProps {
	features: TranslateResult[];
	badge: ReactElement;
}

export default EmailProviderStackedFeatures;
