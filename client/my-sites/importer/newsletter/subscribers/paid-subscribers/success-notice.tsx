import { Notice } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';

export default function SuccessNotice( { allEmailsCount }: { allEmailsCount: number } ) {
	const { _n } = useI18n();
	return (
		<Notice status="success" className="importer__notice" isDismissible={ false }>
			{ createInterpolateElement(
				sprintf(
					// translators: %d is the number of subscribers
					_n(
						'All set! We’ve found <strong>%d subscriber</strong> to import.',
						'All set! We’ve found <strong>%d subscribers</strong> to import.',
						allEmailsCount
					),
					allEmailsCount
				),
				{
					strong: <strong />,
				}
			) }
		</Notice>
	);
}
