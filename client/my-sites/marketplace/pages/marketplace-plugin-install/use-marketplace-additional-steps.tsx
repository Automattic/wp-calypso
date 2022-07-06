import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

function useMarketplaceAdditionalSteps() {
	const translate = useTranslate();
	const additionalSteps = useMemo(
		() => [
			translate( 'Connecting the dots' ),
			translate( 'Still working' ),
			translate( 'Wheels are in motion' ),
			translate( 'Working magic' ),
			translate( 'Putting the pieces together' ),
			translate( 'Assembling the parts' ),
			translate( 'Stacking the building blocks' ),
			translate( 'Getting our ducks in a row' ),
			translate( 'Initiating countdown' ),
			translate( 'Flipping the switches' ),
			translate( 'Unlocking potential' ),
			translate( 'Gears are turning' ),
		],
		[ translate ]
	);
	return additionalSteps;
}
export default useMarketplaceAdditionalSteps;
