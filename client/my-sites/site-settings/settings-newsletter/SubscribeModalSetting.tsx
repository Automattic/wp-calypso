import { ExternalLink, ToggleControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SupportInfo from 'calypso/components/support-info';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const SUBSCRIBE_MODAL_OPTION = 'sm_enabled';

type SubscribeModalSettingProps = {
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	disabled?: boolean;
};

export const SubscribeModalSetting = ( {
	value = false,
	handleToggle,
	disabled,
}: SubscribeModalSettingProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;

	// Construct a link to edit the modal
	const { data: activeThemeData } = useActiveThemeQuery( siteId, true );
	const isFSEActive = activeThemeData?.[ 0 ]?.is_block_theme ?? false;
	const themeSlug = activeThemeData?.[ 0 ]?.stylesheet;
	const siteEditorUrl = useSelector( ( state: object ) => getSiteEditorUrl( state, siteId ) );
	const subscribeModalEditorUrl = isFSEActive
		? addQueryArgs( siteEditorUrl, {
				postType: 'wp_template_part',
				postId: `${ themeSlug }//jetpack-subscribe-modal`,
				canvas: 'edit',
		  } )
		: false;

	const onEditClick = () => {
		recordTracksEvent( 'calypso_settings_subscriber_modal_edit_click' );
	};

	return (
		<>
			<SupportInfo
				text={ translate(
					'Automatically add a subscribe form pop-up to every post and turn visitors into subscribers. It will appear as readers scroll through your posts.'
				) }
				privacyLink={ false }
			/>
			<ToggleControl
				checked={ !! value }
				onChange={ handleToggle( SUBSCRIBE_MODAL_OPTION ) }
				disabled={ disabled }
				label={
					<>
						{ translate( 'Show subscription pop-up when scrolling a post.' ) }
						{ subscribeModalEditorUrl && (
							<>
								{ ' ' }
								<ExternalLink href={ subscribeModalEditorUrl } onClick={ onEditClick }>
									{ translate( 'Preview and edit' ) }
								</ExternalLink>
							</>
						) }
					</>
				}
			/>
		</>
	);
};
