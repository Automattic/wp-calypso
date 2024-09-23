import { useTranslate } from 'i18n-calypso';
import SiteMigrationHowToMigrate from '../site-migration-how-to-migrate';
import type { Step } from '../../types';

const MigratioHowToMigrate: Step = ( props ) => {
	const translate = useTranslate();

	return (
		<SiteMigrationHowToMigrate
			{ ...props }
			headerText={ translate( 'Need a hand?' ) }
			subHeaderText={ translate( 'There are two ways to get your site migrated.' ) }
		/>
	);
};

export default MigratioHowToMigrate;
