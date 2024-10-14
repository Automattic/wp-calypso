import { Notice } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';

export default function SuccessNotice( { allEmailsCount }: { allEmailsCount: number } ) {
	return (
		<Notice status="success" className="importer__notice" isDismissible={ false }>
			{ createInterpolateElement(
				sprintf(
					// @TODO: add _n() translation function once we finalize this copy.
					// translators: %d is the number of subscribers
					'All set! We’ve found <strong>%d subscribers</strong> to import.',
					allEmailsCount
				),
				{
					strong: <strong />,
				}
			) }
		</Notice>
	);
}
