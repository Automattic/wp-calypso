/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { preventWidows } from 'calypso/lib/formatting';
import { JETPACK_PRICING_PAGE } from 'calypso/lib/url/support';

const NoSitePurchasesMessage: React.FC = () => {
	const translate = useTranslate();

	return (
		<Main className="empty-content">
			<EmptyContent
				action={
					<a className="empty-content__action button is-primary" href={ JETPACK_PRICING_PAGE }>
						{ translate( 'Upgrade for quick restores' ) }
					</a>
				}
				illustration={ '/calypso/images/illustrations/security.svg' }
				illustrationWidth={ 200 }
				title={ preventWidows( translate( 'Upgrade for quick restores' ) ) }
				line={ preventWidows(
					translate(
						'Server credentials are used to restore your site and fix any vulnerabilities'
					)
				) }
			/>
		</Main>
	);
};

export default NoSitePurchasesMessage;
