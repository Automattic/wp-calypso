import { Step } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { Icon, image, link, title, trendingUp } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import { getMigrationWizardSteps } from '../../../flows/site-migration-flow/wizard-steps';
import { useFlowState } from '../../state-manager/store';
import { MigrationWizardProgress } from '../components/migration-wizard-progress';
import type { Step as StepType } from '../../types';

import './style.scss';

const useAnalysisCounts = () => {
	const { get } = useFlowState();

	// A user can land here without passing through the scan, so nothing is assumed to exist.
	return get( 'site-migration-scan' )?.analysis?.counts;
};

const SiteMigrationSeo: StepType< { submits: undefined } > = ( { navigation } ) => {
	const { __ } = useI18n();
	const counts = useAnalysisCounts();
	const pages = counts?.pages;
	const images = counts?.images;

	const cards = [
		{
			key: 'urls',
			icon: link,
			title: pages
				? sprintf(
						/* translators: %d: number of URLs found on the source site, e.g. 12. */
						__( 'All %d URLs preserved' ),
						pages
				  )
				: __( 'Every URL preserved' ),
			text: __(
				'Each page keeps the address it has today, so existing links and search results carry on working.'
			),
		},
		{
			key: 'images',
			icon: image,
			title: images
				? sprintf(
						/* translators: %d: number of images found on the source site, e.g. 42. */
						__( 'All %d images' ),
						images
				  )
				: __( 'All your images' ),
			text: __( 'Alt text, captions, and file names come across exactly as they are.' ),
		},
		{
			key: 'metadata',
			icon: title,
			title: __( 'Titles and descriptions' ),
			text: __(
				'Page titles and meta descriptions transfer untouched, so your search listings stay familiar.'
			),
		},
		{
			key: 'performance',
			icon: trendingUp,
			title: __( 'Faster pages, better signals' ),
			text: __(
				'Our global CDN and caching usually cut load times, and speed is something search engines reward.'
			),
		},
	];

	return (
		<>
			<DocumentHead title={ __( 'Your Google ranking comes with you' ) } />
			<Step.CenteredColumnLayout
				className="step-container-v2--site-migration-seo"
				columnWidth={ 8 }
				topBar={
					<Step.TopBar
						centerElement={
							<MigrationWizardProgress
								steps={ getMigrationWizardSteps() }
								current="site-migration-seo"
							/>
						}
					/>
				}
				heading={
					<Step.Heading
						align="left"
						text={ __( 'Your Google ranking comes with you' ) }
						subText={ __(
							'Search engines find the same content at the same addresses, so the ranking you have built stays with you.'
						) }
					/>
				}
				stickyBottomBar={ () => (
					<Step.StickyBottomBar
						leftElement={
							navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
						rightElement={
							<Step.PrimaryButton onClick={ () => navigation.submit( undefined ) }>
								{ __( 'Continue' ) }
							</Step.PrimaryButton>
						}
					/>
				) }
			>
				<ul className="site-migration-seo__cards">
					{ cards.map( ( card ) => (
						<li key={ card.key } className="site-migration-seo__card">
							<Icon className="site-migration-seo__card-icon" icon={ card.icon } size={ 24 } />
							<h2 className="site-migration-seo__card-title">{ card.title }</h2>
							<p className="site-migration-seo__card-text">{ card.text }</p>
						</li>
					) ) }
				</ul>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationSeo;
