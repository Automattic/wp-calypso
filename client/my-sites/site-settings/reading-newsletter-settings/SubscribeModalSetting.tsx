import { ExternalLink, ToggleControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export const SUBSCRIBE_MODAL_OPTION = 'sm_enabled';

type SubscribeModalSettingProps = {
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	disabled?: boolean;
};

const isModalEditTranslated =
	getLocaleSlug()?.startsWith( 'en' ) || i18n.hasTranslation( 'Preview and edit the popup' );
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

	// Construct a link to edit the modal
	const editApiUrl = 'https://wordpress.com'; // @TODO
	const siteSlug = useSelector( getSelectedSiteSlug ); // alternatively get getSelectedSiteId or whole object getSelectedSite
	const subscribeModalEditUrl = addQueryArgs( editApiUrl, {
		siteSlug,
	} );

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
							'Grow your subscriber list by enabling a pop-up modal with a subscribe form. This will show as readers scroll.'
					  )
					: translate(
							'Grow your subscriber list by enabling a popup modal with a subscribe form. This will show as readers scroll.'
					  ) }
				{ isModalEditTranslated && (
					<>
						{ ' ' }
						<ExternalLink href={ subscribeModalEditUrl }>
							{ translate( 'Preview and edit the popup' ) }
						</ExternalLink>
					</>
				) }
			</FormSettingExplanation>
		</>
	);
};
