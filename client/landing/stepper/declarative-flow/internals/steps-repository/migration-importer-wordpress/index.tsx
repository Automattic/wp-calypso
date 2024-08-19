import { StepNavigationLink } from '@automattic/onboarding';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Step } from '../../types';
import ImporterWordpress from '../importer-wordpress';
import { MigrationImportWordpressActions as Actions } from './actions';

const MigrationUpgradePlan: Step = ( props ) => {
	const translate = useTranslate();
	const { navigation } = props;

	const handleClick = () =>
		navigation?.submit?.( {
			action: Actions.MIGRATE,
		} );

	return (
		<ImporterWordpress
			{ ...props }
			customizedActionButtons={
				<StepNavigationLink
					direction="forward"
					handleClick={ handleClick }
					label={ translate( 'I want to migrate my entire site' ) }
					cssClass={ clsx( 'step-container__navigation-link', 'forward', 'has-underline' ) }
					borderless
				/>
			}
		/>
	);
};

export default MigrationUpgradePlan;
