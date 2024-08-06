import { ExternalLink, ToggleControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const SUBSCRIBE_OVERLAY_OPTION = 'jetpack_subscribe_overlay_enabled';

type SubscribeOverlaySettingProps = {
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	disabled?: boolean;
};

export const SubscribeOverlaySetting = ( {
	value = false,
	handleToggle,
	disabled,
}: SubscribeOverlaySettingProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;

	// Construct a link to edit the overlay
	const { data: activeThemeData } = useActiveThemeQuery( siteId, true );
	const isFSEActive = activeThemeData?.[ 0 ]?.is_block_theme ?? false;
	const themeSlug = activeThemeData?.[ 0 ]?.stylesheet;
	const siteEditorUrl = useSelector( ( state: object ) => getSiteEditorUrl( state, siteId ) );
	const subscribeOverlayEditorUrl = isFSEActive
		? addQueryArgs( siteEditorUrl, {
				postType: 'wp_template_part',
				postId: `${ themeSlug }//jetpack-subscribe-overlay`,
				canvas: 'edit',
		  } )
		: false;

	const onEditClick = () => {
		recordTracksEvent( 'calypso_settings_subscriber_overlay_edit_click' );
	};

	return (
		<ToggleControl
			checked={ !! value }
			onChange={ handleToggle( SUBSCRIBE_OVERLAY_OPTION ) }
			disabled={ disabled }
			label={
				<>
					{ translate( 'Subscription overlay on homepage.' ) }
					{ subscribeOverlayEditorUrl && (
						<>
							{ ' ' }
							<ExternalLink href={ subscribeOverlayEditorUrl } onClick={ onEditClick }>
								{ translate( 'Preview and edit' ) }
							</ExternalLink>
						</>
					) }
				</>
			}
		/>
	);
};
