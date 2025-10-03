import { localizeUrl } from '@automattic/i18n-utils';
import { JETPACK_PRICING_PAGE } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { preventWidows } from 'calypso/lib/formatting';

const NoSitePurchasesMessage: React.FC = () => {
	const translate = useTranslate();

	return (
		<Main className="empty-content">
			<EmptyContent
				action={
					<a
						className="empty-content__action button is-primary"
						href={ localizeUrl( JETPACK_PRICING_PAGE ) }
					>
						{ translate( 'Upgrade for quick restores' ) }
					</a>
				}
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
