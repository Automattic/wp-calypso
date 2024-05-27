import { Button, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import clsx from 'classnames';
import { useTranslate } from 'i18n-calypso';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { useGetPostByEmail } from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-get-post-by-email';
import { useRegeneratePostByEmailMutation } from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-regenerate-post-by-email-mutation';
import { useTogglePostByEmailMutation } from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-toggle-post-by-email';
import { useDispatch, useSelector } from 'calypso/state';
import { regeneratePostByEmail as jetpackRegeneratePostByEmail } from 'calypso/state/jetpack/settings/actions';
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
	const selectedSiteId = useSelector( getSelectedSiteId ) || 0;
	const siteIsJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSiteId ) );
	const siteIsAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSiteId ) );
	const jetpackRegeneratingPostByEmail = useSelector( ( state ) =>
		isRegeneratingJetpackPostByEmail( state, selectedSiteId )
	);
	const jetpackPostByEmailIsActive = !! useSelector( ( state ) =>
		isJetpackModuleActive( state, selectedSiteId, moduleSlug )
	);
	const siteInDevMode = useSelector( ( state ) =>
		isJetpackSiteInDevelopmentMode( state, selectedSiteId )
	);
	const moduleUnavailableInDevMode = useSelector( ( state ) =>
		isJetpackModuleUnavailableInDevelopmentMode( state, selectedSiteId, moduleSlug )
	);
	const moduleUnavailable = siteInDevMode && moduleUnavailableInDevMode;
	const { data: simpleSitePostByEmailSettings } = useGetPostByEmail( selectedSiteId );
	const { mutate: simpleSiteTogglePostByEmail, isPending: isSimpleSitePendingToggle } =
		useTogglePostByEmailMutation( selectedSiteId );
	const { mutate: simpleSiteRegeneratePostByEmail, isPending: isSimpleSitePendingRegenerate } =
		useRegeneratePostByEmailMutation( selectedSiteId );

	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleToggleForSimpleSite = ( checked: boolean ) => {
		if ( ! selectedSiteId ) {
			return;
		}

		simpleSiteTogglePostByEmail( checked, {
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

		if ( siteIsJetpack ) {
			dispatch( jetpackRegeneratePostByEmail( selectedSiteId ) );
			return;
		}

		simpleSiteRegeneratePostByEmail( undefined, {
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
	const isActive = siteIsJetpack
		? jetpackPostByEmailIsActive
		: simpleSitePostByEmailSettings?.isEnabled;
	const isDisabledForBothFlows =
		isFormPending ||
		jetpackRegeneratingPostByEmail ||
		isSimpleSitePendingRegenerate ||
		! isActive ||
		!! moduleUnavailable;

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
						checked={ !! simpleSitePostByEmailSettings?.isEnabled }
						disabled={ isFormPending || isSimpleSitePendingToggle || isSimpleSitePendingRegenerate }
						label={ translate( 'Post by Email' ) }
						onChange={ handleToggleForSimpleSite }
					/>
				) }

				<div className="publishing-tools__module-settings site-settings__child-settings">
					<FormLabel
						className={ clsx( {
							'is-disabled': isDisabledForBothFlows,
						} ) }
					>
						{ translate( 'Send your new posts to this email address:' ) }
					</FormLabel>
					<ClipboardButtonInput
						className="publishing-tools__email-address"
						disabled={ isDisabledForBothFlows }
						value={ siteIsJetpack ? email : simpleSitePostByEmailSettings?.email }
					/>
					<Button onClick={ handleRegenerate } disabled={ isDisabledForBothFlows }>
						{ jetpackRegeneratingPostByEmail
							? translate( 'Regenerating…' )
							: translate( 'Regenerate address' ) }
					</Button>
				</div>
			</FormFieldset>
		</>
	);
};
