import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PreferencesLogin from '../preferences-login';

export default function Preferences() {
	return (
		<PageLayout size="small">
			<PageHeader title={ __( 'Preferences' ) } />
			<PreferencesLogin />
		</PageLayout>
	);
}
