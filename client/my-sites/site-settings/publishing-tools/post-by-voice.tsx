import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useGetPostByVoice } from './hooks/use-get-post-by-voice';
import { useRegeneratePostByVoiceMutation } from './hooks/use-regenerate-post-by-voice-mutation';
import { useSwitchPostByVoiceMutation } from './hooks/use-switch-post-by-voice-mutation';

import './style.scss';

type PostByVoiceSettingComponentProps = {
	selectedSiteId: number | null;
	successNotice: typeof successNotice;
	errorNotice: typeof errorNotice;
};

const PostByVoiceSettingComponent = ( {
	selectedSiteId,
	successNotice,
	errorNotice,
}: PostByVoiceSettingComponentProps ) => {
	const translate = useTranslate();
	const { data: postByVoiceSettings } = useGetPostByVoice( selectedSiteId );
	const { mutate: switchPostByVoice, isPending: isPendingSwitch } =
		useSwitchPostByVoiceMutation( selectedSiteId );
	const { mutate: regeneratePostByVoice, isPending: isPendingRegenerate } =
		useRegeneratePostByVoiceMutation( selectedSiteId );

	const handleSwitch = ( checked: boolean ) => {
		switchPostByVoice( checked, {
			onSuccess: () => {
				successNotice( translate( 'Changes saved successfully!' ) );
			},
			onError: () => {
				errorNotice( translate( 'There was a problem saving your changes.' ) );
			},
		} );
	};

	const handleRegenerate = () => {
		regeneratePostByVoice( undefined, {
			onSuccess: () => {
				successNotice( translate( 'Code regenerated successfully!' ) );
			},
			onError: () => {
				errorNotice( translate( 'There was a problem regenerating the code.' ) );
			},
		} );
	};

	return (
		<div>
			<SupportInfo
				text={ translate(
					'Post by Voice is a way to publish audio posts to your blog with a phone call.'
				) }
				link={ localizeUrl( 'https://wordpress.com/support/post-by-voice/' ) }
				privacyLink={ false }
			/>

			<ToggleControl
				checked={ !! postByVoiceSettings?.isEnabled }
				disabled={ isPendingSwitch || isPendingRegenerate }
				label={ translate( 'Post by Voice' ) }
				onChange={ handleSwitch }
			/>

			<div className="publishing-tools__module-settings site-settings__child-settings">
				<FormSettingExplanation>
					{ translate( 'Post audio recordings to your blog by placing a phone call.' ) }
				</FormSettingExplanation>

				{ postByVoiceSettings?.isEnabled && postByVoiceSettings.code && (
					<>
						<div className="post-by-voice__info">
							{ translate(
								'Call {{b}}%(phone)s{{/b}} and enter {{b}}%(code)s{{/b}} for the code.',
								{
									args: {
										phone: '+1 (713) 574-9075',
										code: postByVoiceSettings.code,
									},
									components: {
										b: <b />,
									},
									comment: 'Information about the code to enter when posting by voice',
								}
							) }
						</div>
						<Button onClick={ handleRegenerate } disabled={ isPendingRegenerate }>
							{ translate( 'Regenerate code' ) }
						</Button>
					</>
				) }
			</div>
		</div>
	);
};

export const PostByVoiceSetting = connect(
	( state: IAppState ) => {
		const selectedSiteId = getSelectedSiteId( state ) || 0;

		return {
			selectedSiteId,
		};
	},
	{
		successNotice,
		errorNotice,
	}
)( PostByVoiceSettingComponent );
