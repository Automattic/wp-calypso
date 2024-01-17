import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
export const SUBSCRIBE_MODAL_ON_COMMENT_OPTION = 'jetpack_verbum_subscription_modal';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

type SubscribeModalOnCommentSettingProps = {
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	disabled?: boolean;
};

export const SubscribeModalOnCommentSetting = ( {
	value = false,
	handleToggle,
	disabled,
}: SubscribeModalOnCommentSettingProps ) => {
	const translate = useTranslate();

	return (
		<>
			<ToggleControl
				checked={ !! value }
				onChange={ handleToggle( SUBSCRIBE_MODAL_ON_COMMENT_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Enable subscription pop-up for commenters' ) }
			/>
			<FormSettingExplanation>
				{ translate( 'Ask your readers to subscribe after commenting.' ) }
			</FormSettingExplanation>
		</>
	);
};
