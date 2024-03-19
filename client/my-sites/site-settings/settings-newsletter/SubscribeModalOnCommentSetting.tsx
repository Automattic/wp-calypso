import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import SupportInfo from 'calypso/components/support-info';

const SUBSCRIBE_MODAL_ON_COMMENT_OPTION = 'jetpack_verbum_subscription_modal';

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
			<SupportInfo
				text={ translate( 'Ask your readers to subscribe after commenting.' ) }
				privacyLink={ false }
			/>
			<ToggleControl
				checked={ !! value }
				onChange={ handleToggle( SUBSCRIBE_MODAL_ON_COMMENT_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Enable subscription pop-up for commenters' ) }
			/>
		</>
	);
};
