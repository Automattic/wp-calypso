import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import type { NameServersToggleProps } from './types';

const wpcomNameServersToggleButtonClick = ( domainName: string, enabled: boolean ) => {
	const state = enabled ? 'On' : 'Off';

	return composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Click Toggle Button in "Use WordPress.com Name Servers" Section to "${ state }" in domain settings`,
			'Domain Name',
			domainName
		),
		recordTracksEvent(
			'calypso_domain_management_name_servers_wpcom_name_servers_toggle_button_click',
			{
				domain_name: domainName,
				enabled,
			}
		)
	);
};

const NameserversToggle = ( {
	enabled,
	onToggle,
	selectedDomainName,
	isSaving,
}: NameServersToggleProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const handleToggle = () => {
		dispatch( wpcomNameServersToggleButtonClick( selectedDomainName, ! enabled ) );
		onToggle();
	};

	return (
		<form className="name-servers-toggle">
			<ToggleControl
				onChange={ handleToggle }
				checked={ enabled }
				disabled={ isSaving }
				label={ translate( 'Use WordPress.com name servers' ) }
			/>
		</form>
	);
};

export default NameserversToggle;
