import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import { useGetPostByVoice } from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-get-post-by-voice';
import { useRegeneratePostByVoiceMutation } from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-regenerate-post-by-voice-mutation';
import { useTogglePostByVoiceMutation } from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-toggle-post-by-voice-mutation';
import { useSelector, useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const noticeConfig = {
	duration: 4000,
};

export const PostByVoiceSetting = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const { data: postByVoiceSettings } = useGetPostByVoice( selectedSiteId );
	const { mutate: switchPostByVoice, isPending: isPendingSwitch } =
		useTogglePostByVoiceMutation( selectedSiteId );
	const { mutate: regeneratePostByVoice, isPending: isPendingRegenerate } =
		useRegeneratePostByVoiceMutation( selectedSiteId );

	const handleSwitch = ( checked: boolean ) => {
		switchPostByVoice( checked, {
			onSuccess: () => {
				dispatch( successNotice( translate( 'Settings saved successfully!' ), noticeConfig ) );
			},
			onError: () => {
				dispatch(
					errorNotice( translate( 'There was a problem saving your changes.' ), noticeConfig )
				);
			},
		} );
	};

	const handleRegenerate = () => {
		regeneratePostByVoice( undefined, {
			onSuccess: () => {
				dispatch( successNotice( translate( 'Code regenerated successfully!' ), noticeConfig ) );
			},
			onError: () => {
				dispatch(
					errorNotice( translate( 'There was a problem regenerating the code.' ), noticeConfig )
				);
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
				label={ translate( 'Post by Voice', {
					comment:
						'Post by Voice is the name of a blog setting that lets users post to their blogs by placing a phone call',
				} ) }
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
								'Call {{b}}%(phone)s{{/b}} and enter the posting code {{b}}%(code)s{{/b}}.',
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
							{ translate( 'Regenerate code', {
								comment:
									'Button label to regenerate the secret PIN code used by the Post by Voice feature',
							} ) }
						</Button>
					</>
				) }
			</div>
		</div>
	);
};
