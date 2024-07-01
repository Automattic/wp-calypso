import { ExternalLink, ToggleControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const SUBSCRIBE_POST_END_OPTION = 'jetpack_subscriptions_subscribe_post_end_enabled';

interface SubscribePostEndSettingProps {
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	disabled?: boolean;
}

export const SubscribePostEndSetting = ( {
	value = false,
	handleToggle,
	disabled,
}: SubscribePostEndSettingProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;

	const siteEditorUrl = useSelector( ( state: object ) => getSiteEditorUrl( state, siteId ) );
	const { data: activeThemeData } = useActiveThemeQuery( siteId, true );
	const showEditLink = !! activeThemeData?.[ 0 ]?.is_block_theme;

	const getEditUrl = () => {
		const themeSlug = activeThemeData?.[ 0 ]?.stylesheet;

		return addQueryArgs( siteEditorUrl, {
			postType: 'wp_template',
			postId: `${ themeSlug }//single`,
			canvas: 'edit',
		} );
	};

	const onEditClick = () => {
		recordTracksEvent( 'calypso_settings_subscribe_post_end_edit_click' );
	};

	return (
		<ToggleControl
			checked={ !! value }
			onChange={ handleToggle( SUBSCRIBE_POST_END_OPTION ) }
			disabled={ disabled }
			label={
				<>
					{ translate( 'Add the Subscribe Block at the end of each post' ) }
					{ showEditLink && (
						<>
							{ '. ' }
							<ExternalLink href={ getEditUrl() } onClick={ onEditClick }>
								{ translate( 'Preview and edit' ) }
							</ExternalLink>
						</>
					) }
				</>
			}
		/>
	);
};
