import { useTranslate } from 'i18n-calypso';
import { HelpCenterActionButton } from '../../components/help-center/help-center-action-button';
import SiteMigrationHowToMigrate from '../site-migration-how-to-migrate';
import type { Step } from '../../types';

const MigratioHowToMigrate: Step = ( props ) => {
	const translate = useTranslate();
	const customizedActionButton = <HelpCenterActionButton />;

	return (
		<SiteMigrationHowToMigrate
			{ ...props }
			headerText={ translate( 'Need a hand?' ) }
			subHeaderText={ translate( 'There are two ways to get your site migrated.' ) }
			customizedActionButtons={ customizedActionButton }
		/>
	);
};

export default MigratioHowToMigrate;
