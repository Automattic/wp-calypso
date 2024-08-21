import { StepNavigationLink } from '@automattic/onboarding';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Step } from '../../types';
import SiteMigrationUpgradePlan from '../site-migration-upgrade-plan';
import { MigrationUpgradePlanActions as Actions } from './actions';

const MigrationUpgradePlan: Step = ( props ) => {
	const translate = useTranslate();
	const { navigation } = props;

	const handleClick = () =>
		navigation?.submit?.( {
			action: Actions.IMPORT_CONTENT_ONLY,
		} );

	return (
		<SiteMigrationUpgradePlan
			{ ...props }
			headerText={ translate( 'Here’s the plan you need' ) }
			customizedActionButtons={
				<StepNavigationLink
					direction="forward"
					handleClick={ handleClick }
					label={ translate( 'I want to import my content only' ) }
					cssClass={ clsx( 'step-container__navigation-link', 'forward', 'has-underline' ) }
					borderless
				/>
			}
		/>
	);
};

export default MigrationUpgradePlan;
