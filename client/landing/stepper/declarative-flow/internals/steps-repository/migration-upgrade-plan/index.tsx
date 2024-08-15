import { StepNavigationLink } from '@automattic/onboarding';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { Step } from '../../types';
import SiteMigrationUpgradePlan from '../site-migration-upgrade-plan';
import { MigrationUpgradePlanActions as Actions } from './actions';

interface Props {
	onClick: () => void;
	label: string;
}
const ImportButton: FC< Props > = ( { onClick, label } ) => {
	return (
		<div className="step-container__skip-wrapper">
			<StepNavigationLink
				direction="forward"
				handleClick={ onClick }
				label={ label }
				cssClass={ clsx( 'step-container__navigation-link', 'has-underline' ) }
				borderless
			/>
		</div>
	);
};

const MigrationUpgradePlan: Step = ( props ) => {
	const translate = useTranslate();
	const { navigation } = props;
	return (
		<SiteMigrationUpgradePlan
			{ ...props }
			headerText={ translate( 'Here’s the plan you need' ) }
			customizedActionButtons={
				<ImportButton
					label={ translate( 'I want to import my content only' ) }
					onClick={ () =>
						navigation?.submit?.( {
							action: Actions.IMPORT_CONTENT_ONLY,
						} )
					}
				/>
			}
		/>
	);
};

export default MigrationUpgradePlan;
