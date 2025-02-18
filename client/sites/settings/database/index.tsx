import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import PhpMyAdminForm from './form';

export default function DatabaseSettings() {
	const translate = useTranslate();

	return (
		<Panel className="settings-database phpmyadmin-card">
			<NavigationHeader
				title={ translate( 'Database' ) }
				subtitle={ translate(
					'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL.'
				) }
			/>
			<PhpMyAdminForm disabled={ false } />
		</Panel>
	);
}
