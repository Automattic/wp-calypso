import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { preventWidows } from 'calypso/lib/formatting';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors/has-dashboard-opt-in';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import InstallThemeButton from './install-theme-button';
import useThemeShowcaseDescription from './use-theme-showcase-description';
import useThemeShowcaseLoggedOutSeoContent from './use-theme-showcase-logged-out-seo-content';
import useThemeShowcaseTitle from './use-theme-showcase-title';

const shouldSkipTitleFormatting = ( { filter, tier } ) => {
	return ( ! filter || filter === 'recommended' ) && ( ! tier || tier === 'all' );
};

export default function ThemeShowcaseHeader( {
	canonicalUrl,
	filter,
	tier,
	vertical,
	isCollectionView = false,
	noIndex = false,
	isSiteECommerceFreeTrial = false,
} ) {
	// eslint-disable-next-line no-shadow
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const selectedSiteId = useSelector( getSelectedSiteId );

	const description = useThemeShowcaseDescription( { filter, tier, vertical } );
	const title = useThemeShowcaseTitle( { filter, tier, vertical } );
	const skipTitleFormatting = shouldSkipTitleFormatting( { filter, tier } );
	const loggedOutSeoContent = useThemeShowcaseLoggedOutSeoContent( filter, tier );
	const dashboardOptIn = useSelector( ( state ) => hasDashboardOptIn( state ) );
	const shouldUseLoggedInHeader =
		isEnabled( 'themes/universal-header' ) && dashboardOptIn ? selectedSiteId : isLoggedIn;

	const {
		title: documentHeadTitle,
		metaDescription: metaDescription,
		header: themesHeaderTitle,
		description: themesHeaderDescription,
	} = shouldUseLoggedInHeader
		? {
				title: title,
				metaDescription: description,
				header: translate( 'Themes' ),
				description: translate(
					'Select or update the visual design for your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="themes" showIcon={ false } />,
						},
					}
				),
		  }
		: loggedOutSeoContent;

	// Don't show the Install Theme button if the site is on a Ecommerce free trial or siteID is not available
	const showInstallThemeButton = ! isSiteECommerceFreeTrial && !! selectedSiteId;

	const metas = [
		{
			name: 'description',
			property: 'og:description',
			content: metaDescription || themesHeaderDescription,
		},
		{ property: 'og:title', content: documentHeadTitle },
		{ property: 'og:url', content: canonicalUrl },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:site_name', content: 'WordPress.com' },
	];

	if ( noIndex ) {
		metas.push( {
			name: 'robots',
			content: 'noindex',
		} );
	}

	if ( isCollectionView ) {
		return (
			<DocumentHead
				title={ documentHeadTitle }
				meta={ metas }
				skipTitleFormatting={ skipTitleFormatting }
			/>
		);
	}

	return (
		<>
			<DocumentHead
				title={ documentHeadTitle }
				meta={ metas }
				skipTitleFormatting={ skipTitleFormatting }
			/>
			{ shouldUseLoggedInHeader ? (
				<div className="themes__header-navigation-container">
					<NavigationHeader
						compactBreadcrumb={ false }
						navigationItems={ [] }
						mobileItem={ null }
						title={ translate( 'Themes' ) }
						subtitle={ translate(
							'Select or update the visual design for your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
							{
								components: {
									learnMoreLink: <InlineSupportLink supportContext="themes" showIcon={ false } />,
								},
							}
						) }
					>
						{ showInstallThemeButton && <InstallThemeButton /> }
					</NavigationHeader>
				</div>
			) : (
				<div className="themes__header-logged-out">
					<div className="themes__page-heading">
						<h1>{ preventWidows( themesHeaderTitle ) }</h1>
						<p className="page-sub-header">{ preventWidows( themesHeaderDescription ) }</p>
					</div>
				</div>
			) }
		</>
	);
}
