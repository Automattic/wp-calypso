import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { preventWidows } from 'calypso/lib/formatting';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isWooCYSEligibleSite } from 'calypso/state/sites/selectors';
import { isDefaultWooExpressThemeActive } from 'calypso/state/themes/selectors/is-wooexpress-default-theme-active';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import InstallThemeButton from './install-theme-button';
import PatternAssemblerButton from './pattern-assembler-button';
import useThemeShowcaseDescription from './use-theme-showcase-description';
import useThemeShowcaseLoggedOutSeoContent from './use-theme-showcase-logged-out-seo-content';
import useThemeShowcaseTitle from './use-theme-showcase-title';

export default function ThemeShowcaseHeader( {
	canonicalUrl,
	filter,
	tier,
	vertical,
	isCollectionView = false,
	noIndex = false,
	onPatternAssemblerButtonClick,
	isSiteWooExpressOrEcomFreeTrial = false,
} ) {
	// eslint-disable-next-line no-shadow
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const _isDefaultWooExpressThemeActive = useSelector( ( state ) =>
		isDefaultWooExpressThemeActive( state, selectedSiteId )
	);
	const isWooCYSSite = useSelector( ( state ) => isWooCYSEligibleSite( state, selectedSiteId ) );
	const description = useThemeShowcaseDescription( { filter, tier, vertical } );
	const title = useThemeShowcaseTitle( { filter, tier, vertical } );
	const loggedOutSeoContent = useThemeShowcaseLoggedOutSeoContent( filter, tier );
	const {
		title: documentHeadTitle,
		metaDescription: metaDescription,
		header: themesHeaderTitle,
		description: themesHeaderDescription,
	} = isLoggedIn
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

	// Don't show the Install Theme button if the site is Woo CYS site and the default WooExpress theme is active
	const showInstallThemeButton =
		! ( isWooCYSSite && _isDefaultWooExpressThemeActive ) && !! selectedSiteId;

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
		return <DocumentHead title={ documentHeadTitle } meta={ metas } />;
	}

	return (
		<>
			<DocumentHead title={ documentHeadTitle } meta={ metas } />
			{ isLoggedIn ? (
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
					{ isLoggedIn && ! isSiteWooExpressOrEcomFreeTrial && (
						<PatternAssemblerButton isPrimary onClick={ onPatternAssemblerButtonClick } />
					) }
				</NavigationHeader>
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
