import { Button, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { useGetPostByEmail } from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-get-post-by-email';
import { useRegeneratePostByEmailMutation } from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-regenerate-post-by-email-mutation';
import { useTogglePostByEmailMutation } from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-toggle-post-by-email';
import { useDispatch, useSelector } from 'calypso/state';
import { regeneratePostByEmail } from 'calypso/state/jetpack/settings/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import isRegeneratingJetpackPostByEmail from 'calypso/state/selectors/is-regenerating-jetpack-post-by-email';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type PostByEmailSettingProps = {
	isFormPending: boolean;
	address?: string;
};

const noticeConfig = {
	duration: 4000,
};

const moduleSlug = 'post-by-email';

export const PostByEmailSetting = ( { isFormPending, address }: PostByEmailSettingProps ) => {
	const {
		siteId: selectedSiteId,
		siteIsJetpack: isJetpack,
		siteIsAtomic: isAtomic,
		regenerating: regeneratingPostByEmail,
		isActive: active,
		moduleIsUnavailable: moduleUnavailable,
	} = useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state ) || 0;
		const siteIsJetpack = isJetpackSite( state, siteId );
		const siteIsAtomic = isSiteAutomatedTransfer( state, siteId );
		const regenerating = isRegeneratingJetpackPostByEmail( state, siteId );
		const isActive = !! isJetpackModuleActive( state, siteId, moduleSlug );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, siteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
			state,
			siteId,
			moduleSlug
		);

		return {
			siteId,
			siteIsJetpack,
			siteIsAtomic,
			regenerating,
			isActive,
			moduleIsUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		};
	} );
	const { data: postByEmailSettings } = useGetPostByEmail( selectedSiteId );
	const { mutate: switchPostByEmail, isPending: isPendingSwitch } =
		useTogglePostByEmailMutation( selectedSiteId );
	const { mutate: regeneratePostByEmailSimple, isPending: isPendingRegenerate } =
		useRegeneratePostByEmailMutation( selectedSiteId );

	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleSwitchForSimpleSite = ( checked: boolean ) => {
		if ( ! selectedSiteId ) {
			return;
		}

		switchPostByEmail( checked, {
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
		if ( ! selectedSiteId ) {
			return;
		}

		if ( isJetpack ) {
			dispatch( regeneratePostByEmail( selectedSiteId ) );
			return;
		}

		regeneratePostByEmailSimple( undefined, {
			onSuccess: () => {
				dispatch( successNotice( translate( 'Address regenerated successfully!' ), noticeConfig ) );
			},
			onError: () => {
				dispatch(
					errorNotice( translate( 'There was a problem regenerating the address.' ), noticeConfig )
				);
			},
		} );
	};

	const email = address && address !== 'regenerate' ? address : '';
	const labelClassName =
		moduleUnavailable ||
		regeneratingPostByEmail ||
		( isJetpack ? ! active : ! postByEmailSettings?.isEnabled )
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
						isAtomic
							? localizeUrl( 'https://wordpress.com/support/post-by-email/' )
							: 'https://jetpack.com/support/post-by-email/'
					}
					privacyLink={ ! isAtomic }
				/>
				{ isJetpack ? (
					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="post-by-email"
						label={ translate( 'Publish posts by sending an email' ) }
						disabled={ isFormPending || moduleUnavailable }
					/>
				) : (
					<ToggleControl
						checked={ !! postByEmailSettings?.isEnabled }
						disabled={ isPendingSwitch || isPendingRegenerate }
						label={ translate( 'Post by Email' ) }
						onChange={ handleSwitchForSimpleSite }
					/>
				) }

				<div className="publishing-tools__module-settings site-settings__child-settings">
					<FormLabel className={ labelClassName }>
						{ translate( 'Send your new posts to this email address:' ) }
					</FormLabel>
					<ClipboardButtonInput
						className="publishing-tools__email-address"
						disabled={
							regeneratingPostByEmail ||
							( isJetpack ? ! active : ! postByEmailSettings?.isEnabled ) ||
							moduleUnavailable
						}
						value={ isJetpack ? email : postByEmailSettings?.email }
					/>
					<Button
						onClick={ handleRegenerate }
						disabled={
							isFormPending ||
							regeneratingPostByEmail ||
							isPendingRegenerate ||
							( isJetpack ? ! active : ! postByEmailSettings?.isEnabled ) ||
							!! moduleUnavailable
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
