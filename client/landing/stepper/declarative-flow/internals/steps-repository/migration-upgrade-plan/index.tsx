import { useTranslate } from 'i18n-calypso';
import { Step } from '../../types';
import SiteMigrationUpgradePlan from '../site-migration-upgrade-plan';

const MigrationUpgradePlan: Step = ( props ) => {
	const translate = useTranslate();
	const { navigation } = props;
	return (
		<SiteMigrationUpgradePlan
			{ ...props }
			skipLabelText={ translate( 'I want to import my content only' ) }
			skipPosition="top"
			onSkip={ () => navigation?.submit?.( { action: 'skip', goToCheckout: false } ) }
			headerText={ translate( 'Here’s the plan you need' ) }
		/>
	);
};

export default MigrationUpgradePlan;
