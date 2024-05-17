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
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import isRegeneratingJetpackPostByEmail from 'calypso/state/selectors/is-regenerating-jetpack-post-by-email';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type PostByEmailSettingProps = {
	isFormPending: boolean;
	address?: string;
};

type PostByEmailSettingComponentProps = PostByEmailSettingProps & {
	selectedSiteId: number | null;
	regeneratePostByEmail: ( siteId: number ) => void;
	activateModule: ( siteId: number, moduleSlug: string ) => void;
	deactivateModule: ( siteId: number, moduleSlug: string ) => void;
	active: boolean;
	moduleUnavailable: boolean | null;
	regeneratingPostByEmail: boolean;
	siteIsAtomic: boolean;
	siteIsJetpack: boolean | null;
};

const moduleSlug = 'post-by-email';

const PostByEmailSettingComponent = ( {
	selectedSiteId,
	isFormPending,
	regeneratePostByEmail,
	activateModule,
	deactivateModule,
	active,
	moduleUnavailable,
	regeneratingPostByEmail,
	siteIsAtomic,
	siteIsJetpack,
	address,
}: PostByEmailSettingComponentProps ) => {
	const translate = useTranslate();

	const handleRegenerate = () => {
		if ( ! selectedSiteId ) {
			return;
		}

		regeneratePostByEmail( selectedSiteId );
	};

	const email = address && address !== 'regenerate' ? address : '';
	const labelClassName =
		moduleUnavailable || regeneratingPostByEmail || ! active ? 'is-disabled' : undefined;

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
						disabled={ regeneratingPostByEmail || ! active || moduleUnavailable }
						value={ email }
					/>
					<Button
						onClick={ handleRegenerate }
						disabled={
							isFormPending || regeneratingPostByEmail || ! active || !! moduleUnavailable
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
		const siteIsJetpack = isJetpackSite( state, selectedSiteId );
		const isAtomic = isSiteAutomatedTransfer( state, selectedSiteId );
		const regeneratingPostByEmail = isRegeneratingJetpackPostByEmail( state, selectedSiteId );
		const active = !! isJetpackModuleActive( state, selectedSiteId, moduleSlug );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
			state,
			selectedSiteId,
			moduleSlug
		);

		return {
			selectedSiteId,
			siteIsJetpack,
			isAtomic,
			regeneratingPostByEmail,
			active,
			moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		};
	},
	{
		activateModule,
		deactivateModule,
		regeneratePostByEmail,
	}
)( PostByEmailSettingComponent );
