import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
export const SUBSCRIBE_MODAL_ON_COMMENT_OPTION = 'jetpack_verbum_subscription_modal';

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
				label={ translate( 'Display subscription suggestion after comment' ) }
			/>
		</>
	);
};
