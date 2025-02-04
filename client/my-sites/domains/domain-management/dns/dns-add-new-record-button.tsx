import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useCurrentRoute } from 'calypso/components/route';
import { domainManagementDnsAddRecord } from 'calypso/my-sites/domains/paths';
import { DndAddNewRecordButtonProps } from './types';

function DnsAddNewRecordButton( { site, domain, isMobile }: DndAddNewRecordButtonProps ) {
	const { __ } = useI18n();
	const { currentRoute } = useCurrentRoute();
	const className = clsx( 'dns__breadcrumb-button add-record', {
		'is-icon-button': isMobile,
	} );
	return (
		<Button
			borderless={ isMobile }
			href={ domainManagementDnsAddRecord( site, domain, currentRoute ) }
			className={ className }
			primary
		>
			<Icon className="add-record__icon" icon={ plus } viewBox="4 4 16 16" size={ 16 } />
			{ ! isMobile && __( 'Add a record' ) }
		</Button>
	);
}

export default DnsAddNewRecordButton;
