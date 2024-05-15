import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import { activateModule, deactivateModule } from 'calypso/state/jetpack/modules/actions';
import { regeneratePostByEmail } from 'calypso/state/jetpack/settings/actions';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

type PostByVoiceSettingProps = {
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	code?: string;
};

type PostByVoiceSettingComponentProps = PostByVoiceSettingProps & {
	selectedSiteId: number | null;
	regeneratePostByEmail: ( siteId: number ) => void;
	activateModule: ( siteId: number, moduleSlug: string ) => void;
	deactivateModule: ( siteId: number, moduleSlug: string ) => void;
	active: boolean;
};

const moduleSlug = 'post-by-email';

const PostByVoiceSettingComponent = ( {
	isRequestingSettings,
	isSavingSettings,
	selectedSiteId,
	regeneratePostByEmail,
	code,
	activateModule,
	deactivateModule,
	active,
}: PostByVoiceSettingComponentProps ) => {
	const isFormPending = isRequestingSettings || isSavingSettings;
	const translate = useTranslate();

	const handleRegenerate = () => {
		if ( ! selectedSiteId ) {
			return;
		}

		regeneratePostByEmail( selectedSiteId );
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
				checked={ active }
				disabled={ isFormPending }
				label={ translate( 'Post by Voice' ) }
				onChange={ ( checked ) => {
					if ( ! selectedSiteId ) {
						return;
					}

					if ( checked ) {
						activateModule( selectedSiteId, moduleSlug );
					} else {
						deactivateModule( selectedSiteId, moduleSlug );
					}
				} }
			/>

			<div className="publishing-tools__module-settings site-settings__child-settings">
				<FormSettingExplanation>
					{ translate( 'Post audio recordings to your blog by placing a phone call.' ) }
				</FormSettingExplanation>

				{ active && code && (
					<>
						<div className="post-by-voice__info">
							{ translate(
								'Call {{b}}%(phone)s{{/b}} and enter {{b}}%(code)s{{/b}} for the code.',
								{
									args: {
										phone: '+1 (713) 574-9075',
										code,
									},
									components: {
										b: <b />,
									},
									comment: 'Information about the code to enter when posting by voice',
								}
							) }
						</div>
					</>
				) }
				{ active && (
					<Button onClick={ handleRegenerate } disabled={ isFormPending }>
						{ ! code ? translate( 'Generate code' ) : translate( 'Regenerate code' ) }
					</Button>
				) }
			</div>
		</div>
	);
};

export const PostByVoiceSetting = connect(
	( state: IAppState ) => {
		const selectedSiteId = getSelectedSiteId( state ) || 0;
		const active = !! isJetpackModuleActive( state, selectedSiteId, moduleSlug );

		return {
			selectedSiteId,
			active,
		};
	},
	{
		activateModule,
		deactivateModule,
		regeneratePostByEmail,
	}
)( PostByVoiceSettingComponent );
