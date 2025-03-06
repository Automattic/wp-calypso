/* eslint-disable no-restricted-imports */
import { useTranslate } from 'i18n-calypso';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import HelpCenterInlineButton from './help-center-inline-button';
import type { FC } from 'react';

interface HelpCenterStepButtonProps {
	flowName?: string;
	helpCenterButtonCopy?: string;
	helpCenterButtonLink?: string;
}

const HelpCenterStepButton: FC< HelpCenterStepButtonProps > = ( {
	flowName,
	helpCenterButtonCopy,
	helpCenterButtonLink,
} ) => {
	const translate = useTranslate();
	const { data: geoData } = useGeoLocationQuery();

	if ( geoData?.country_short === 'US' ) {
		return null;
	}

	return (
		<div className="step-wrapper__help-center-button-container">
			<label>{ helpCenterButtonCopy ?? translate( 'Need extra help?' ) }</label>{ ' ' }
			<HelpCenterInlineButton flowName={ flowName } className="step-wrapper__help-center-button">
				{ helpCenterButtonLink ?? translate( 'Visit Help Center' ) }
			</HelpCenterInlineButton>
		</div>
	);
};

export default HelpCenterStepButton;
