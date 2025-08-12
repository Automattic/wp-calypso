import { WPCOM_FEATURES_SITE_PREVIEW_LINKS } from '@automattic/calypso-products';
import { FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SitePreviewLinks from 'calypso/components/site-preview-links';
import { useDispatch, useSelector } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import {
	SiteSettingPrivacyPremiumStylesNotice,
	SiteSettingsPrivacyDiscourageSearchEnginesNotice,
} from './notice';
import type { Fields } from './index';

interface SiteSettingPrivacyFormProps {
	fields: Fields;
	updateFields: ( fields: Fields ) => void;
	isAtomicAndEditingToolkitDeactivated: boolean;
	isComingSoon: boolean;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	isUnlaunchedSite: boolean;
	isWPForTeamsSite: boolean | null;
	isWpcomStagingSite: boolean;
	siteIsAtomic: boolean | null;
	siteIsJetpack: boolean | null;
}

const SiteSettingPrivacyForm = ( {
	fields,
	siteIsAtomic,
	siteIsJetpack,
	updateFields,
	isAtomicAndEditingToolkitDeactivated,
	isComingSoon,
	isRequestingSettings,
	isSavingSettings,
	isUnlaunchedSite,
	isWPForTeamsSite,
	isWpcomStagingSite,
}: SiteSettingPrivacyFormProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const siteSlug = useSelector( getSelectedSiteSlug );
	const hasSitePreviewLink = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SITE_PREVIEW_LINKS )
	);

	const primaryDomain = useSelector( ( state ) => getPrimaryDomainBySiteId( state, siteId ) );

	const { globalStylesInUse, shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

	const blogPublic = Number( fields.blog_public );
	const wpcomComingSoon = 1 === Number( fields.wpcom_coming_soon );
	const wpcomPublicComingSoon = 1 === Number( fields.wpcom_public_coming_soon );
	const wpcomDataSharingOptOut = !! fields.wpcom_data_sharing_opt_out;
	// isPrivateAndUnlaunched means it is an unlaunched coming soon v1 site
	const isPrivateAndUnlaunched = -1 === blogPublic && isUnlaunchedSite;
	const isNonAtomicJetpackSite = siteIsJetpack && ! siteIsAtomic;
	const isAnyComingSoonEnabled =
		( 0 === blogPublic && wpcomPublicComingSoon ) || isPrivateAndUnlaunched || wpcomComingSoon;
	const isComingSoonDisabled = isRequestingSettings || isAtomicAndEditingToolkitDeactivated;
	const isPublicChecked =
		( wpcomPublicComingSoon && blogPublic === 0 && isComingSoonDisabled ) ||
		( blogPublic === 0 && ! wpcomPublicComingSoon ) ||
		blogPublic === 1;

	const showPreviewLink = isComingSoon && hasSitePreviewLink;
	const shouldShowPremiumStylesNotice = globalStylesInUse && shouldLimitGlobalStyles;

	const discourageSearchChecked =
		( wpcomPublicComingSoon && blogPublic === 0 && isComingSoonDisabled ) ||
		( 0 === blogPublic && ! wpcomPublicComingSoon ) ||
		primaryDomain?.isWpcomStagingDomain;

	const recordEvent = ( message: string ) => {
		dispatch( recordGoogleEvent( 'Site Settings', message ) );
	};

	const handleVisibilityOptionChange = ( {
		blog_public,
		wpcom_coming_soon,
		wpcom_public_coming_soon,
		wpcom_data_sharing_opt_out,
	}: Fields ) => {
		recordEvent( `Set blog_public to ${ blog_public }` );
		recordEvent( `Set wpcom_coming_soon to ${ wpcom_coming_soon }` );
		recordEvent( `Set wpcom_public_coming_soon to ${ wpcom_public_coming_soon }` );
		recordEvent( `Set wpcom_data_sharing_opt_out to ${ wpcom_data_sharing_opt_out }` );
		updateFields( {
			blog_public,
			wpcom_coming_soon,
			wpcom_public_coming_soon,
			wpcom_data_sharing_opt_out,
		} );
	};

	return (
		<form>
			{ siteId && <QuerySiteDomains siteId={ siteId } /> }
			<FormFieldset>
				{ ! isNonAtomicJetpackSite &&
					! isWPForTeamsSite &&
					! isAtomicAndEditingToolkitDeactivated && (
						<>
							{ shouldShowPremiumStylesNotice && (
								<SiteSettingPrivacyPremiumStylesNotice
									selectedSite={ selectedSite }
									siteSlug={ siteSlug }
								/>
							) }
							<FormLabel
								className={ clsx( 'site-settings__visibility-label is-coming-soon', {
									'is-coming-soon-disabled': isComingSoonDisabled,
								} ) }
							>
								<FormRadio
									className={ undefined }
									name="blog_public"
									value="0"
									checked={ isAnyComingSoonEnabled }
									onChange={ () =>
										handleVisibilityOptionChange( {
											blog_public: 0,
											wpcom_coming_soon: 0,
											wpcom_public_coming_soon: 1,
											wpcom_data_sharing_opt_out: false,
										} )
									}
									disabled={ isComingSoonDisabled }
									onClick={ () => {
										recordEvent( 'Clicked Site Visibility Radio Button' );
									} }
									label={ translate( 'Coming Soon' ) }
								/>
							</FormLabel>
							<FormSettingExplanation>
								{ translate(
									'Your site is hidden from visitors behind a "Coming Soon" notice until it is ready for viewing.'
								) }
							</FormSettingExplanation>
							{ showPreviewLink && selectedSite && (
								<div className="site-settings__visibility-label is-checkbox">
									<SitePreviewLinks
										siteUrl={ selectedSite.URL }
										siteId={ siteId }
										disabled={ ! isAnyComingSoonEnabled || isSavingSettings }
										forceOff={ ! isAnyComingSoonEnabled }
										source="privacy-settings"
									/>
								</div>
							) }
						</>
					) }
				{ ! isNonAtomicJetpackSite && (
					<>
						<FormLabel className="site-settings__visibility-label is-public">
							<FormRadio
								className={ undefined }
								name="blog_public"
								value="1"
								checked={ isPublicChecked }
								onChange={ () =>
									handleVisibilityOptionChange( {
										blog_public: isWpcomStagingSite ? 0 : 1,
										wpcom_coming_soon: 0,
										wpcom_public_coming_soon: 0,
										wpcom_data_sharing_opt_out: false,
									} )
								}
								disabled={ isRequestingSettings }
								onClick={ () => {
									recordEvent( 'Clicked Site Visibility Radio Button' );
								} }
								label={ translate( 'Public' ) }
							/>
						</FormLabel>
						<FormSettingExplanation>
							{ isWpcomStagingSite
								? translate(
										'Your site is visible to everyone, but search engines are discouraged from indexing staging sites.'
								  )
								: translate( 'Your site is visible to everyone.' ) }
						</FormSettingExplanation>
					</>
				) }

				{ isPublicChecked && ! isWpcomStagingSite && (
					<>
						<FormLabel className="site-settings__visibility-label is-checkbox is-hidden">
							<FormInputCheckbox
								name="blog_public"
								value="0"
								checked={ discourageSearchChecked }
								onChange={ () =>
									handleVisibilityOptionChange( {
										blog_public: wpcomPublicComingSoon || blogPublic !== 0 ? 0 : 1,
										wpcom_coming_soon: 0,
										wpcom_public_coming_soon: 0,
										wpcom_data_sharing_opt_out: true,
									} )
								}
								// See https://github.com/Automattic/wp-calypso/issues/101828.
								disabled={ isRequestingSettings || primaryDomain?.isWpcomStagingDomain }
								onClick={ () => {
									recordEvent( 'Clicked Site Visibility Radio Button' );
								} }
							/>
							<span>{ translate( 'Discourage search engines from indexing this site' ) }</span>
							<FormSettingExplanation>
								{ translate(
									'This option does not block access to your site — it is up to search engines to honor your request.'
								) }
							</FormSettingExplanation>
							{ primaryDomain?.isWpcomStagingDomain && (
								<SiteSettingsPrivacyDiscourageSearchEnginesNotice
									selectedSite={ selectedSite }
									siteSlug={ siteSlug }
								/>
							) }
						</FormLabel>
						{ ! isNonAtomicJetpackSite && (
							<FormLabel className="site-settings__visibility-label is-checkbox is-hidden">
								<FormInputCheckbox
									name="wpcom_data_sharing_opt_out"
									value="true"
									checked={
										( wpcomPublicComingSoon && wpcomDataSharingOptOut && isComingSoonDisabled ) ||
										( wpcomDataSharingOptOut && ! wpcomPublicComingSoon ) ||
										discourageSearchChecked
									}
									onChange={ () =>
										handleVisibilityOptionChange( {
											blog_public: wpcomPublicComingSoon || blogPublic !== 0 ? 1 : 0,
											wpcom_coming_soon: 0,
											wpcom_public_coming_soon: 0,
											wpcom_data_sharing_opt_out: ! wpcomDataSharingOptOut,
										} )
									}
									disabled={ isRequestingSettings || discourageSearchChecked }
									onClick={ () => recordEvent( 'Clicked Partnership Radio Button' ) }
								/>
								<span style={ { overflowWrap: 'anywhere' } }>
									{ translate( 'Prevent third-party sharing for %(siteName)s', {
										args: {
											siteName: siteSlug || '',
										},
									} ) }
								</span>
								<FormSettingExplanation>
									{ translate(
										'This option will prevent this site’s content from being shared with our licensed network of content and research partners, including those that train AI models. {{a}}Learn more{{/a}}.',
										{
											components: {
												a: (
													<InlineSupportLink
														showIcon={ false }
														supportContext="privacy-prevent-third-party-sharing"
													/>
												),
											},
										}
									) }
								</FormSettingExplanation>
							</FormLabel>
						) }
					</>
				) }
				{ ! isNonAtomicJetpackSite && (
					<>
						<FormLabel className="site-settings__visibility-label is-private">
							<FormRadio
								className={ undefined }
								name="blog_public"
								value="-1"
								checked={
									( -1 === blogPublic && ! wpcomComingSoon && ! isPrivateAndUnlaunched ) ||
									( wpcomComingSoon && isAtomicAndEditingToolkitDeactivated )
								}
								onChange={ () =>
									handleVisibilityOptionChange( {
										blog_public: -1,
										wpcom_coming_soon: 0,
										wpcom_public_coming_soon: 0,
										wpcom_data_sharing_opt_out: false,
									} )
								}
								disabled={ isRequestingSettings }
								onClick={ () => {
									recordEvent( 'Clicked Site Visibility Radio Button' );
								} }
								label={ translate( 'Private' ) }
							/>
						</FormLabel>
						<FormSettingExplanation>
							{ translate(
								'Your site is only visible to you and logged-in members you approve. Everyone else will see a log in screen.'
							) }
						</FormSettingExplanation>
					</>
				) }
			</FormFieldset>
		</form>
	);
};

export default SiteSettingPrivacyForm;
