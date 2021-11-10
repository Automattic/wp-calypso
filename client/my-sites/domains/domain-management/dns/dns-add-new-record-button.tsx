import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { domainManagementDnsAddRecord } from 'calypso/my-sites/domains/paths';
import './dns-breadcrumb-button.scss';
import { DndAddNewRecordButtonProps } from './types';

function DnsAddNewRecordButton( { site, domain }: DndAddNewRecordButtonProps ): JSX.Element {
	const { __ } = useI18n();
	return (
		<Button
			primary
			href={ domainManagementDnsAddRecord( site, domain ) }
			className={ 'dns__breadcrumb-button' }
		>
			{ __( 'Add a new record' ) }
		</Button>
	);
}

export default DnsAddNewRecordButton;
