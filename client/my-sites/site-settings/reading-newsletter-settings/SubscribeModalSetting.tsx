import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

export const SUBSCRIBE_MODAL_OPTION = 'wpcom_subscribe_modal';

const ToggleControl = OriginalToggleControl as React.ComponentType<
	OriginalToggleControl.Props & {
		disabled?: boolean;
	}
>;

type SubscribeModalSettingProps = {
	value?: boolean;
	handleToggle: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	disabled?: boolean;
};

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
				label={ translate( 'Enable subscriber modal' ) }
			/>
			<FormSettingExplanation>
				{ translate(
					'Grow your subscriber list by enabling a popup modal with a subscribe form. This will show as readers scroll. {{link}}Edit the modal here.{{/link}}.',
					{
						components: {
							link: (
								<a
									// TODO: add url to modal template
									href={ localizeUrl( '#' ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				) }
			</FormSettingExplanation>
		</>
	);
};
