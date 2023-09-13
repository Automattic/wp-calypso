import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import InstallThemeButton from './install-theme-button';
import ThemesHeader from './themes-header';
import useThemeShowcaseDescription from './use-theme-showcase-description';
import useThemeShowcaseLoggedOutSeoContent from './use-theme-showcase-logged-out-seo-content';
import useThemeShowcaseTitle from './use-theme-showcase-title';

export default function ThemeShowcaseHeader( { canonicalUrl, filter, tier, vertical } ) {
	// eslint-disable-next-line no-shadow
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
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

	return (
		<>
			<DocumentHead title={ documentHeadTitle } meta={ metas } />
			<ThemesHeader title={ themesHeaderTitle } description={ themesHeaderDescription }>
				{ isLoggedIn && (
					<>
						<div className="themes__install-theme-button-container">
							<InstallThemeButton />
						</div>
						<ScreenOptionsTab wpAdminPath="themes.php" />
					</>
				) }
			</ThemesHeader>
		</>
	);
}
