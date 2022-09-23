import { localize } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import customizeImage from 'calypso/assets/images/illustrations/dashboard.svg';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import PurchaseDetail from 'calypso/components/purchase-detail';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const CustomizeTheme = ( { translate, isFSEActive, isFSEActiveLoading } ) => {
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
				isSubmitting={ isFSEActiveLoading }
				icon={ <img alt="" src={ customizeImage } /> }
				title={ translate( 'Advanced customization' ) }
				description={ translate(
					"Change your site's appearance in a few clicks, with an expanded " +
						'selection of fonts and colors.'
				) }
				buttonText={ isFSEActiveLoading ? translate( 'Loading…' ) : customizeThemeButtonText }
				href={ customizeLink }
			/>
		</div>
	);
};

export default withIsFSEActive( localize( CustomizeTheme ) );
