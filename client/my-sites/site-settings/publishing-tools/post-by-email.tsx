import { Button, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';

type PostByEmailSettingProps = {
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	postByEmailAddress?: string;
};

type PostByEmailSettingComponentProps = PostByEmailSettingProps & {
	moduleUnavailable: boolean;
	postByEmailAddressModuleActive: boolean;
	regeneratePostByEmail: ( siteId: number ) => void;
	regeneratingPostByEmail: boolean;
	selectedSiteId: number | null;
	siteIsAtomic: boolean;
	siteIsJetpack: boolean;
	activateModule: ( siteId: number, moduleSlug: string ) => void;
	deactivateModule: ( siteId: number, moduleSlug: string ) => void;
	onRegenerateButtonClick: () => void;
};

export const PostByEmailSettingComponent = ( {
	isRequestingSettings,
	isSavingSettings,
	moduleUnavailable,
	postByEmailAddressModuleActive,
	regeneratingPostByEmail,
	selectedSiteId,
	siteIsAtomic,
	onRegenerateButtonClick,
	postByEmailAddress,
}: PostByEmailSettingComponentProps ) => {
	const isFormPending = isRequestingSettings || isSavingSettings;
	const translate = useTranslate();

	const email = postByEmailAddress && postByEmailAddress !== 'regenerate' ? postByEmailAddress : '';
	const labelClassName =
		moduleUnavailable || regeneratingPostByEmail || ! postByEmailAddressModuleActive
			? 'is-disabled'
			: undefined;

	return (
		<>
			<FormFieldset>
				<SupportInfo
					text={ translate(
						'Allows you to publish new posts by sending an email to a special address.'
					) }
					link={
						siteIsAtomic
							? localizeUrl( 'https://wordpress.com/support/post-by-email/' )
							: 'https://jetpack.com/support/post-by-email/'
					}
					privacyLink={ ! siteIsAtomic }
				/>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="post-by-email"
					label={ translate( 'Publish posts by sending an email' ) }
					disabled={ isFormPending || moduleUnavailable }
				/>

				<div className="publishing-tools__module-settings site-settings__child-settings">
					<FormLabel className={ labelClassName }>
						{ translate( 'Send your new posts to this email address:' ) }
					</FormLabel>
					<ClipboardButtonInput
						className="publishing-tools__email-address"
						disabled={
							regeneratingPostByEmail || ! postByEmailAddressModuleActive || moduleUnavailable
						}
						value={ email }
					/>
					<Button
						onClick={ onRegenerateButtonClick }
						disabled={
							isFormPending ||
							regeneratingPostByEmail ||
							! postByEmailAddressModuleActive ||
							moduleUnavailable
						}
					>
						{ regeneratingPostByEmail
							? translate( 'Regenerating…' )
							: translate( 'Regenerate address' ) }
					</Button>
				</div>
			</FormFieldset>
		</>
	);
};
