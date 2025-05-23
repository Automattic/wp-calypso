import { FormInputValidation } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { Icon, warning } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

type Props = {
	error: Subscriber.ImportSubscribersError;
};

export default function PaidImportSubscribersError( { error }: Props ) {
	const { __ } = useI18n();
	const HANDLED_ERROR = {
		IMPORT_LIMIT: 'subscriber_import_limit_reached',
		IMPORT_BLOCKED: 'blocked_import',
		IMPORT_RUNNING: 'import_running',
		MISSING_ARGS: 'missing_arguments',
		EMPTY_CSV_FILE: 'empty_csv_file',
		CSV_UPLOAD_ERROR: 'csv_upload_error',
		CSV_INVALID_TYPE: 'csv_invalid_type',
	};

	return (
		<FormInputValidation icon="warning" isError={ false } isWarning text="">
			<Icon icon={ warning } />
			{ ( (): React.ReactNode => {
				switch ( error.code ) {
					case HANDLED_ERROR.IMPORT_LIMIT:
						return __(
							'We couldn’t import your subscriber list as you’ve hit the 100 email limit for our free plan. The good news? You can upload a list of any size after upgrading to any paid plan.'
						);

					case HANDLED_ERROR.IMPORT_BLOCKED:
						return __(
							'We ran into a security issue with your subscriber list. It’s nothing to worry about. If you reach out to our support team when you’ve finished setting things up, they’ll help resolve this for you.'
						);
					case HANDLED_ERROR.IMPORT_RUNNING:
						return __(
							'A subscriber import has already started. Please wait till that one finished before starting a new one.'
						);
					case HANDLED_ERROR.MISSING_ARGS:
					case HANDLED_ERROR.EMPTY_CSV_FILE:
					case HANDLED_ERROR.CSV_UPLOAD_ERROR:
					case HANDLED_ERROR.CSV_INVALID_TYPE:
						return __( 'Please double check your CSV file to make sure that it contains emails.' );

					default:
						return typeof error.message === 'string'
							? error.message
							: __(
									'An unexpected error occurred. Please try again later or contact support if the problem persists.'
							  );
				}
			} )() }
		</FormInputValidation>
	);
}
