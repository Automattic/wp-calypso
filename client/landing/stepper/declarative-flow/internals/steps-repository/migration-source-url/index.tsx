import { useTranslate } from 'i18n-calypso';
import { Step } from '../../types';
import SiteMigrationSourceUrl from '../site-migration-source-url';

const MigrationSourceUrl: Step = ( props ) => {
	const translate = useTranslate();

	return (
		<SiteMigrationSourceUrl
			{ ...props }
			headerText={ translate( 'Let’s migrate your site' ) }
			subHeaderText={ translate(
				"Just drop your site's URL below and our team will review and start your migration."
			) }
		/>
	);
};

export default MigrationSourceUrl;
