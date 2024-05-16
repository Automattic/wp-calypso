import { Button, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { activateModule, deactivateModule } from 'calypso/state/jetpack/modules/actions';
import { regeneratePostByEmail } from 'calypso/state/jetpack/settings/actions';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type PostByEmailSettingProps = {
	isFormPending: boolean;
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
	active: boolean;
};

const moduleSlug = 'post-by-email';

const PostByEmailSettingComponent = ( {
	isFormPending,
	moduleUnavailable,
	postByEmailAddressModuleActive,
	regeneratingPostByEmail,
	selectedSiteId,
	siteIsAtomic,
	siteIsJetpack,
	activateModule,
	deactivateModule,
	onRegenerateButtonClick,
	postByEmailAddress,
	active,
}: PostByEmailSettingComponentProps ) => {
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
				{ siteIsJetpack ? (
					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="post-by-email"
						label={ translate( 'Publish posts by sending an email' ) }
						disabled={ isFormPending || moduleUnavailable }
					/>
				) : (
					<ToggleControl
						checked={ active }
						disabled={ isFormPending }
						label={ translate( 'Post by Email' ) }
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
				) }

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

export const PostByEmailSetting = connect(
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
)( PostByEmailSettingComponent );
