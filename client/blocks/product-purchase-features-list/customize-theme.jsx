import { localize } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import customizeImage from 'calypso/assets/images/illustrations/dashboard.svg';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import PurchaseDetail from 'calypso/components/purchase-detail';
import withActiveTheme from 'calypso/data/themes/with-active-theme';
import { isActiveThemeFSEEnabled } from 'calypso/lib/theme/utils';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const CustomizeTheme = ( { translate, activeThemeData, isActiveThemeDataLoading } ) => {
	const isFSEActive = isActiveThemeFSEEnabled( activeThemeData );
	const siteId = useSelector( getSelectedSiteId );
	const currentThemeId = useSelector( ( state ) => getActiveTheme( state, siteId ) );
	const customizeLink = useSelector( ( state ) =>
		getCustomizeUrl( state, currentThemeId, siteId, isFSEActive )
	);
	const customizeThemeButtonText = isFSEActive
		? translate( 'Edit site' )
		: translate( 'Start customizing' );

	return (
		<div className="product-purchase-features-list__item">
			<QueryActiveTheme siteId={ siteId } />
			<PurchaseDetail
				isSubmitting={ isActiveThemeDataLoading }
				icon={ <img alt="" src={ customizeImage } /> }
				title={ translate( 'Advanced customization' ) }
				description={ translate(
					"Change your site's appearance in a few clicks, with an expanded " +
						'selection of fonts and colors.'
				) }
				buttonText={ isActiveThemeDataLoading ? translate( 'Loading…' ) : customizeThemeButtonText }
				href={ customizeLink }
			/>
		</div>
	);
};

export default withActiveTheme( localize( CustomizeTheme ) );
