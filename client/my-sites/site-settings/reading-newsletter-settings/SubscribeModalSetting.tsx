import { ToggleControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const SUBSCRIBE_MODAL_OPTION = 'sm_enabled';

type SubscribeModalSettingProps = {
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	disabled?: boolean;
};

const isModalToggleTranslated =
	getLocaleSlug()?.startsWith( 'en' ) || i18n.hasTranslation( 'Enable subscriber pop-up' );
const isModalToggleHelpTranslated =
	getLocaleSlug()?.startsWith( 'en' ) ||
	i18n.hasTranslation(
		'Grow your subscriber list by enabling a pop-up modal with a subscribe form. This will show as readers scroll.'
	);

export const SubscribeModalSetting = ( {
	value = false,
	handleToggle,
	disabled,
}: SubscribeModalSettingProps ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const siteEditorUrl = useSelector( ( state: object ) =>
		getSiteEditorUrl( state, selectedSite?.ID || null )
	);
	const themeSlug = useSelector( ( state ) =>
		getSiteOption( state, selectedSite?.ID, 'theme_slug' )
	);
	const subscribeModalEditorUrl = themeSlug
		? addQueryArgs( siteEditorUrl, {
				postType: 'wp_template_part',
				postId: `${ themeSlug }//subscribe-modal`,
				canvas: 'edit',
		  } )
		: siteEditorUrl;

	return (
		<>
			<ToggleControl
				checked={ !! value }
				onChange={ handleToggle( SUBSCRIBE_MODAL_OPTION ) }
				disabled={ disabled }
				label={
					isModalToggleTranslated
						? translate( 'Enable subscriber pop-up' )
						: translate( 'Enable subscriber modal' )
				}
			/>
			<FormSettingExplanation>
				{ isModalToggleHelpTranslated
					? translate(
							'Grow your subscriber list by enabling a pop-up modal with a subscribe form. This will show as readers scroll. {{link}}Edit the modal{{/link}}.',
							{
								components: {
									link: <a href={ subscribeModalEditorUrl } target="_blank" rel="noreferrer" />,
								},
							}
					  )
					: translate(
							'Grow your subscriber list by enabling a popup modal with a subscribe form. This will show as readers scroll. {{link}}Edit the modal{{/link}}.',
							{
								components: {
									link: <a href={ subscribeModalEditorUrl } target="_blank" rel="noreferrer" />,
								},
							}
					  ) }
			</FormSettingExplanation>
		</>
	);
};
