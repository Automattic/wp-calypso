import { Button, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
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
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type PostByEmailSettingProps = {
	emailAddress?: string;
};

const noticeConfig = {
	duration: 4000,
};

const moduleSlug = 'post-by-email';

export const PostByEmailSetting = ( { emailAddress }: PostByEmailSettingProps ) => {
	const selectedSiteId = useSelector( getSelectedSiteId ) || 0;
	const siteIsJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSiteId ) );
	const jetpackRegeneratingPostByEmail = siteIsJetpack && emailAddress === 'regenerate';
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

	// The first time Post by Email is enabled for a Jetpack site, we need to also trigger an email
	// address regeneration
	useEffect( () => {
		if ( ! siteIsJetpack || moduleUnavailable ) {
			return;
		}

		if ( jetpackPostByEmailIsActive && ! emailAddress && ! jetpackRegeneratingPostByEmail ) {
			dispatch( jetpackRegeneratePostByEmail( selectedSiteId ) );
		}
	}, [
		dispatch,
		emailAddress,
		jetpackPostByEmailIsActive,
		jetpackRegeneratingPostByEmail,
		moduleUnavailable,
		selectedSiteId,
		siteIsJetpack,
	] );

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
				dispatch(
					successNotice(
						translate( 'Address regenerated successfully!', {
							comment: 'Notice text after regenerating the Post by Email email address',
						} ),
						noticeConfig
					)
				);
			},
			onError: () => {
				dispatch(
					errorNotice(
						translate( 'There was a problem regenerating the address.', {
							comment:
								'Notice text when there was an error regenerating the Post by Email email address',
						} ),
						noticeConfig
					)
				);
			},
		} );
	};

	let email;
	if ( siteIsJetpack ) {
		email = emailAddress === 'regenerate' ? '' : emailAddress;
	} else {
		email = simpleSitePostByEmailSettings?.email;
	}

	const isActive = siteIsJetpack
		? jetpackPostByEmailIsActive
		: simpleSitePostByEmailSettings?.isEnabled;
	const isJetpackDisabled = jetpackRegeneratingPostByEmail || moduleUnavailable;
	const isSimpleSiteDisabled = isSimpleSitePendingToggle || isSimpleSitePendingRegenerate;
	const isDisabledControls = ! isActive || isJetpackDisabled || isSimpleSiteDisabled;

	const toggleLabel = translate( 'Publish posts by sending an email' );

	return (
		<>
			<FormFieldset>
				<SupportInfo
					text={ translate(
						'Allows you to publish new posts by sending an email to a special address.'
					) }
					link={
						! siteIsJetpack
							? localizeUrl( 'https://wordpress.com/support/post-by-email/' )
							: 'https://jetpack.com/support/post-by-email/'
					}
					privacyLink={ siteIsJetpack }
				/>

				{ siteIsJetpack ? (
					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug={ moduleSlug }
						label={ toggleLabel }
						disabled={ isJetpackDisabled }
					/>
				) : (
					<ToggleControl
						checked={ !! simpleSitePostByEmailSettings?.isEnabled }
						disabled={ isSimpleSiteDisabled }
						label={ toggleLabel }
						onChange={ handleToggleForSimpleSite }
					/>
				) }

				<div className="publishing-tools__module-settings site-settings__child-settings">
					<FormLabel
						className={ clsx( {
							'is-disabled': isDisabledControls,
						} ) }
					>
						{ translate( 'Send your new posts to this email address:' ) }
					</FormLabel>
					<ClipboardButtonInput
						className="publishing-tools__email-address"
						disabled={ isDisabledControls }
						value={ email }
					/>
					<Button onClick={ handleRegenerate } disabled={ isDisabledControls }>
						{ translate( 'Regenerate address' ) }
					</Button>
				</div>
			</FormFieldset>
		</>
	);
};
