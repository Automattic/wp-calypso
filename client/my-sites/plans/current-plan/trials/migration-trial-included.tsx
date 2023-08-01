import { localize, translate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import advancedDesignTools from 'calypso/assets/images/plans/wpcom/migration-trial/advanced-design-tools.svg';
import beautifulThemes from 'calypso/assets/images/plans/wpcom/migration-trial/beautiful-themes.svg';
import bestInClassHosting from 'calypso/assets/images/plans/wpcom/migration-trial/best-in-class-hosting.svg';
import googleAnalytics from 'calypso/assets/images/plans/wpcom/migration-trial/google-analytics.svg';
import jetpackBackupsAndRestores from 'calypso/assets/images/plans/wpcom/migration-trial/jetpack-backups-and-restores.svg';
import newsletters from 'calypso/assets/images/plans/wpcom/migration-trial/newsletters.svg';
import seoTools from 'calypso/assets/images/plans/wpcom/migration-trial/seo-tools.svg';
import spamProtection from 'calypso/assets/images/plans/wpcom/migration-trial/spam-protection.svg';
import FeatureIncludedCard from '../feature-included-card';

interface Props {
	translate: typeof translate;
	displayAll: boolean;
}
const MigrationTrialIncluded: FunctionComponent< Props > = ( props ) => {
	const { translate, displayAll = true } = props;

	// TODO: translate when final copy is available
	const allIncludedFeatures = [
		{
			title: translate( 'Beautiful themes' ),
			text: translate( 'Set your site apart with professionally designed themes and layouts.' ),
			illustration: beautifulThemes,
			showButton: true,
			buttonText: translate( 'Browse themes' ),
		},
		{
			title: translate( 'Advanced Design Tools' ),
			text: translate(
				'Make your site even more unique with extended color schemes, typography, and control over your site’s CSS.'
			),
			illustration: advancedDesignTools,
			showButton: true,
			buttonText: translate( 'Design your blog' ),
		},
		{
			title: translate( 'Newsletters' ),
			text: translate(
				'Send your new posts directly to your subscriber’s inbox, add monetization options, and create a community.'
			),
			illustration: newsletters,
			showButton: true,
			buttonText: translate( 'Setup a newsletter' ),
		},
		{
			title: translate( 'Jetpack backups and restores' ),
			text: translate(
				'Easily restore or download a backup of your site from any moment in time.'
			),
			illustration: jetpackBackupsAndRestores,
			showButton: true,
			buttonText: '(TBD)',
		},
		{
			title: translate( 'Spam protection' ),
			text: translate(
				'Keep your site free of unwelcome comment, form, and text spam with Akismet.'
			),
			illustration: spamProtection,
			showButton: true,
			buttonText: translate( 'Keep your site safe' ),
		},
		{
			title: translate( 'SEO tools' ),
			text: translate( 'Boost traffic by making your content more findable on search engines.' ),
			illustration: seoTools,
			showButton: true,
			buttonText: translate( 'Increase visibility' ),
		},
		{
			title: translate( 'Google Analytics' ),
			text: translate( 'Access in-depth data on how and why people come to your site.' ),
			illustration: googleAnalytics,
			showButton: true,
			buttonText: translate( 'Connect Google Analytics' ),
		},
		{
			title: translate( 'Best-in-class hosting' ),
			text: translate( 'We take care of hosting your store so you can focus on selling.' ),
			illustration: bestInClassHosting,
			showButton: false,
		},
	];

	const whatsIncluded = displayAll
		? allIncludedFeatures
		: // Show only first 4 items
		  allIncludedFeatures.slice( 0, 4 );

	return (
		<>
			{ whatsIncluded.map( ( feature ) => (
				<FeatureIncludedCard
					key={ feature.title }
					illustration={ feature.illustration }
					title={ feature.title }
					text={ feature.text }
					showButton={ false }
					buttonText={ feature.buttonText }
				></FeatureIncludedCard>
			) ) }
		</>
	);
};

export default localize( MigrationTrialIncluded );
