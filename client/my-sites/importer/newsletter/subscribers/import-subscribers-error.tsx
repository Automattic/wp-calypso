import { FormInputValidation } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { Icon, warning } from '@wordpress/icons';

type Props = {
	error: Subscriber.ImportSubscribersError;
};

export default function PaidImportSubscribersError( { error }: Props ) {
	const HANDLED_ERROR = {
		IMPORT_LIMIT: 'subscriber_import_limit_reached',
		IMPORT_BLOCKED: 'blocked_import',
	};

	return (
		<FormInputValidation icon="warning" isError={ false } isWarning>
			<Icon icon={ warning } />
			{ ( (): React.ReactNode => {
				switch ( error.code ) {
					case HANDLED_ERROR.IMPORT_LIMIT:
						return 'We couldn’t import your subscriber list as you’ve hit the 100 email limit for our free plan. The good news? You can upload a list of any size after upgrading to any paid plan.';

					case HANDLED_ERROR.IMPORT_BLOCKED:
						return 'We ran into a security issue with your subscriber list. It’s nothing to worry about. If you reach out to our support team when you’ve finished setting things up, they’ll help resolve this for you.';

					default:
						return typeof error.message === 'string' ? error.message : '';
				}
			} )() }
		</FormInputValidation>
	);
}
