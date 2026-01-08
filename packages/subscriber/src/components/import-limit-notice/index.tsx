import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	isFreePlan: boolean;
	siteSlug: string;
}

export const ImportLimitNotice: FunctionComponent< Props > = ( { isFreePlan, siteSlug } ) => {
	const { __ } = useI18n();

	if ( isFreePlan ) {
		return (
			<p className="import-limit-notice">
				{ createInterpolateElement(
					__(
						'Free plans have an import limit of 100 subscribers. <a>Upgrade your plan</a> to import unlimited subscribers.'
					),
					{
						a: <a href={ `/plans/${ siteSlug }` } />,
					}
				) }
			</p>
		);
	}

	return (
		<p className="import-limit-notice">
			{ __(
				'Imports of more than 10,000 subscribers will go through a manual review before being added to your site.'
			) }
		</p>
	);
};
