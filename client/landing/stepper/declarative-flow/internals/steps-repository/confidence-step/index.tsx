import { getUrlParts } from '@automattic/calypso-url';
import { Step } from '@automattic/onboarding';
import { getImporterByKey } from 'calypso/lib/importer/importer-config';
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
		/** The platform the source runs on, such as `wix`. */
		platform?: string;
		/** Replaces the heading. */
		title?: string;
		/** Replaces the sub-heading. */
		subTitle?: string;
		/** Replaces the label above the checklist. */
		includesLabel?: string;
		/** Replaces the checklist of what comes across. */
		includes?: string[];
	};
	submits: { action: 'continue' };
} > = function ConfidenceStep( {
	navigation,
	from: sourceProp,
	platform,
	title,
	subTitle,
	includesLabel,
	includes,
} ) {
	const from = sourceProp?.trim() ? addSchemeIfMissing( sourceProp.trim(), 'https' ) : '';
	const { hostname } = getUrlParts( from );
	const platformName = platform
		? getImporterByKey( `importer-type-${ platform }` )?.title
		: undefined;

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
			title={ title }
			subTitle={ subTitle }
			includesLabel={ includesLabel }
			includes={ includes }
			platformName={ platformName }
		/>
	);
};

export default ConfidenceStep;
