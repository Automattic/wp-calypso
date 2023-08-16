import { ToggleControl } from '@wordpress/components';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

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
			</FormSettingExplanation>
		</>
	);
};
