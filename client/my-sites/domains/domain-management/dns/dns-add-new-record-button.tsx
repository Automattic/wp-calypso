import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import './dns-breadcrumb-button.scss';

function DnsAddNewRecordButton(): JSX.Element {
	const { __ } = useI18n();
	return (
		<Button primary href={ '#' } className={ 'dns__breadcrumb-button' }>
			{ __( 'Add a new record' ) }
		</Button>
	);
}

export default DnsAddNewRecordButton;
