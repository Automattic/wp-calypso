import { ExternalLink, ToggleControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const SUBSCRIBE_NAVIGATION_OPTION = 'jetpack_subscriptions_subscribe_navigation_enabled';

interface SubscribeNavigationSettingProps {
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	disabled?: boolean;
}

export const SubscribeNavigationSetting = ( {
	value = false,
	handleToggle,
	disabled,
}: SubscribeNavigationSettingProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;

	const siteEditorUrl = useSelector( ( state: object ) => getSiteEditorUrl( state, siteId ) );
	const { data: activeThemeData } = useActiveThemeQuery( siteId, true );

	const getEditUrl = () => {
		const themeSlug = activeThemeData?.[ 0 ]?.stylesheet;

		return addQueryArgs( siteEditorUrl, {
			postType: 'wp_template',
			postId: `${ themeSlug }//index`,
			canvas: 'edit',
		} );
	};

	const onEditClick = () => {
		recordTracksEvent( 'calypso_settings_subscribe_navigation_edit_click' );
	};

	return (
		<ToggleControl
			checked={ !! value }
			onChange={ handleToggle( SUBSCRIBE_NAVIGATION_OPTION ) }
			disabled={ disabled }
			label={
				<>
					{ translate( 'Add the Subscribe Block to the navigation.' ) }{ ' ' }
					<ExternalLink href={ getEditUrl() } onClick={ onEditClick }>
						{ translate( 'Preview and edit' ) }
					</ExternalLink>
				</>
			}
		/>
	);
};
