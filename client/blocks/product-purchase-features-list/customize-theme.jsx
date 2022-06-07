import { localize } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import customizeImage from 'calypso/assets/images/illustrations/dashboard.svg';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import PurchaseDetail from 'calypso/components/purchase-detail';
import withBlockEditorSettings from 'calypso/data/block-editor/with-block-editor-settings';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const CustomizeTheme = ( { translate, blockEditorSettings, areBlockEditorSettingsLoading } ) => {
	const isFSEActive = blockEditorSettings?.is_fse_active;
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
				isSubmitting={ areBlockEditorSettingsLoading }
				icon={ <img alt="" src={ customizeImage } /> }
				title={ translate( 'Advanced customization' ) }
				description={ translate(
					"Change your site's appearance in a few clicks, with an expanded " +
						'selection of fonts and colors.'
				) }
				buttonText={
					areBlockEditorSettingsLoading ? translate( 'Loading…' ) : customizeThemeButtonText
				}
				href={ customizeLink }
			/>
		</div>
	);
};

export default withBlockEditorSettings( localize( CustomizeTheme ) );
