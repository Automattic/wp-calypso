import { getUrlParts } from '@automattic/calypso-url';
import { Step } from '@automattic/onboarding';
import { addSchemeIfMissing } from 'calypso/lib/url';
import { SiteMigrationConfirm } from '../site-migration-check/confirm';
import type { Step as StepType } from '../../types';

/**
 * The source and where it's going, with what we'll copy, before the customer picks a plan.
 */
const ConfidenceStep: StepType< {
	accepts: {
		/** The source to move, as the customer gave it. */
		from?: string;
	};
	submits: { action: 'continue' };
} > = function ConfidenceStep( { navigation, from: sourceProp } ) {
	const from = sourceProp?.trim() ? addSchemeIfMissing( sourceProp.trim(), 'https' ) : '';
	const { hostname } = getUrlParts( from );

	return (
		<SiteMigrationConfirm
			topBar={
				<Step.TopBar
					leftElement={
						navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : undefined
					}
				/>
			}
			from={ from }
			hostname={ hostname || from }
			isSameSite={ false }
			onChangeSource={ navigation.goBack }
			onContinue={ () => navigation.submit?.( { action: 'continue' } ) }
		/>
	);
};

export default ConfidenceStep;
