/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import GSuiteCompactFeatures from 'components/gsuite/gsuite-features/compact';
import GSuitePrice from 'components/gsuite/gsuite-price';

interface Props {
	currencyCode: string | null;
	cost: number | null;
	domain: string;
	plan: string;
}

const GoogleAppsProductDetails: FunctionComponent< Props > = ( {
	currencyCode,
	cost,
	domain,
	plan,
} ) => {
	const translate = useTranslate();

	return (
		<div className="gsuite-dialog__product-details">
			<div className="gsuite-dialog__product-intro">
				<div className="gsuite-dialog__product-name">
					{ /* Intentionally not translated as it is a brand name and Google keeps it in English */ }
					<span className="gsuite-dialog__product-logo">G Suite</span>
				</div>

				<p>
					{ translate(
						"We've teamed up with Google to offer you email, storage, docs, calendars, " +
							'and more, integrated with your site.'
					) }
				</p>

				<GSuitePrice cost={ cost } currencyCode={ currencyCode } showMonthlyPrice />
			</div>

			<GSuiteCompactFeatures domainName={ domain } productSlug={ plan } type={ 'list' } />
		</div>
	);
};

export default GoogleAppsProductDetails;
