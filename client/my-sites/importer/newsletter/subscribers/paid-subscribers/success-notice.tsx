import { Notice } from '@wordpress/components';

export default function SuccessNotice( { allEmailsCount }: { allEmailsCount: number } ) {
	return (
		<Notice status="success" className="importer__notice" isDismissible={ false }>
			All set! We’ve found <strong>{ allEmailsCount } subscribers</strong> to import.
		</Notice>
	);
}
