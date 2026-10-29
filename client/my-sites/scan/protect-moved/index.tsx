import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Page } from '@wordpress/admin-ui';
import { shield } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FeatureMoved from 'calypso/components/feature-moved';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ReactNode } from 'react';

const ProtectMoved = ( { fallback }: { fallback: ReactNode } ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const siteId = useSelector( getSelectedSiteId );
	const protectUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'admin.php?page=jetpack-protect' )
	);

	if (
		! protectUrl ||
		! hasEnTranslation( 'Scan has moved' ) ||
		! hasEnTranslation(
			'Scan is now part of Jetpack Protect. Access it via Jetpack{{space/}}→{{space/}}Protect in your dashboard.'
		) ||
		! hasEnTranslation( 'Go to Jetpack Protect' )
	) {
		return <>{ fallback }</>;
	}

	return (
		<Main fullWidthLayout className="scan">
			<DocumentHead title={ translate( 'Scan' ) } />
			<Page hasPadding showSidebarToggle={ false }>
				<FeatureMoved
					icon={ shield }
					title={ translate( 'Scan has moved' ) }
					description={ translate(
						'Scan is now part of Jetpack Protect. Access it via Jetpack{{space/}}→{{space/}}Protect in your dashboard.',
						{
							comment:
								'"Jetpack → Protect" uses special HTML spaces to prevent the string from being split in separate lines. Please keep the {{space/}} placeholders before and after the arrow.',
							components: {
								space: <>&nbsp;</>,
							},
						}
					) }
					buttonText={ translate( 'Go to Jetpack Protect' ) }
					buttonLink={ protectUrl }
				/>
			</Page>
		</Main>
	);
};

export default ProtectMoved;
