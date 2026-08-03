import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import EmptyContent from 'calypso/components/empty-content';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { getProductSlugByPeriodVariation } from 'calypso/lib/plugins/utils';
import { useSelector } from 'calypso/state';
import {
	isMarketplaceProduct as isMarketplaceProductSelector,
	getProductsList,
} from 'calypso/state/products-list/selectors';

/**
 * Offers the user a way forward when the theme install page is reached without the handoff state
 * that normally authorizes the install: either back to the theme page, or activate it from here.
 */
export default function ThemeDirectInstall( {
	themeSlug,
	pluginSlug,
	siteSlug,
	theme,
	onActivate,
}: {
	themeSlug: string;
	pluginSlug: string;
	siteSlug?: string | null;
	theme?: { name?: string; screenshot?: string };
	onActivate: () => void;
} ) {
	const translate = useTranslate();
	const productsList = useSelector( getProductsList );
	const isProductListFetched = Object.values( productsList ).length > 0;
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, pluginSlug )
	);
	const { data: wpComPluginData } = useWPCOMPlugin( pluginSlug, {
		enabled: isProductListFetched && isMarketplaceProduct,
	} );

	const marketplaceProductSlug = getProductSlugByPeriodVariation(
		wpComPluginData?.variations?.monthly,
		productsList
	);

	return (
		<>
			<QueryProductsList />
			<EmptyContent
				className="marketplace-plugin-install__direct-install-container"
				illustration={ theme?.screenshot || null }
				illustrationWidth={ theme?.screenshot ? 720 : undefined }
				title={ theme?.name || themeSlug }
				line={ translate( 'Do you want to activate the theme %(theme)s?', {
					args: { theme: theme?.name || themeSlug },
				} ) }
			>
				{ isProductListFetched && (
					<div className="marketplace-plugin-install__direct-install-actions">
						<Button href={ `/themes/${ themeSlug }/${ siteSlug }` }>
							{ translate( 'Go to the theme page' ) }
						</Button>

						{ ! isMarketplaceProduct ? (
							<Button primary onClick={ onActivate }>
								{ translate( 'Activate theme' ) }
							</Button>
						) : (
							<Button
								primary
								onClick={ () =>
									page( `/checkout/${ siteSlug || '' }/${ marketplaceProductSlug }?#step2` )
								}
							>
								{ translate( 'Purchase and activate plugin' ) }
							</Button>
						) }
					</div>
				) }
			</EmptyContent>
		</>
	);
}
