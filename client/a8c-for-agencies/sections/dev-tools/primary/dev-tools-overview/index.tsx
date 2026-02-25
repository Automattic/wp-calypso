import Badge from '@automattic/components/src/badge';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import githubImage from 'calypso/assets/images/a8c-for-agencies/dev-tools/github-deployments.png';
import studioImage from 'calypso/assets/images/a8c-for-agencies/dev-tools/studio.png';
import telexImage from 'calypso/assets/images/a8c-for-agencies/dev-tools/telex.jpg';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function DevToolsOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Developer tools' );

	const handleStudioClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_dev_tools_download_studio_click' ) );
	}, [ dispatch ] );

	const handleGithubClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_dev_tools_connect_repository_click' ) );
	}, [ dispatch ] );

	const handleTelexClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_dev_tools_try_telex_click' ) );
	}, [ dispatch ] );

	return (
		<Layout className="dev-tools-overview" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="dev-tools-overview__intro">
					{ preventWidows(
						translate(
							'Everything you need to build, test, and ship client sites faster, from local development to production deployment.'
						)
					) }
				</div>

				{ /* WordPress Studio */ }
				<PageSectionColumns>
					<PageSectionColumns.Column
						heading={
							<span className="dev-tools-overview__heading">
								{ translate( 'WordPress Studio' ) }
								<Badge type="info-green">{ translate( 'Open Source' ) }</Badge>
							</span>
						}
					>
						<div className="dev-tools-overview__content">
							<div className="dev-tools-overview__description">
								<div className="dev-tools-overview__tagline">
									{ translate( 'Local development, simplified' ) }
								</div>
								<div>
									{ preventWidows(
										translate(
											'Build and test WordPress sites on your machine. No Docker, no MAMP, no configuration files. Just download, launch, and start building.'
										)
									) }
								</div>
							</div>
							<SimpleList
								className="dev-tools-overview__list"
								items={ [
									translate( 'Create local sites in one click' ),
									translate( 'Pull live sites to test changes safely' ),
									translate( 'Push changes directly to production' ),
									translate( 'Share demo sites with clients instantly' ),
									translate( 'Works on macOS and Windows' ),
								] }
							/>
							<Button
								__next40pxDefaultSize
								variant="primary"
								href="https://developer.wordpress.com/studio/"
								target="_blank"
								rel="noopener noreferrer"
								onClick={ handleStudioClick }
							>
								{ translate( 'Download Studio' ) }
							</Button>
						</div>
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ studioImage } alt={ translate( 'WordPress Studio' ) } />
					</PageSectionColumns.Column>
				</PageSectionColumns>

				{ /* GitHub Deployments */ }
				<PageSectionColumns
					background={ {
						color: '#F1F1F2',
					} }
				>
					<PageSectionColumns.Column
						heading={
							<span className="dev-tools-overview__heading">
								{ translate( 'GitHub Deployments' ) }
								<Badge type="info-green">{ translate( 'Git-native' ) }</Badge>
							</span>
						}
					>
						<div className="dev-tools-overview__content">
							<div className="dev-tools-overview__description">
								<div className="dev-tools-overview__tagline">
									{ translate( 'Push code, deploy automatically' ) }
								</div>
								<div>
									{ preventWidows(
										translate(
											'Connect your GitHub repository directly to WordPress.com. Every push to your deployment branch automatically deploys themes, plugins, or full site changes.'
										)
									) }
								</div>
							</div>
							<SimpleList
								className="dev-tools-overview__list"
								items={ [
									translate( 'Deploy on every push to your branch' ),
									translate( 'Trigger manual deploys when you need control' ),
									translate( 'Track every deployment with full history' ),
									translate( 'Choose which branch deploys to production' ),
									translate( 'Ship updates without any downtime' ),
								] }
							/>
							<Button
								__next40pxDefaultSize
								variant="primary"
								href="https://developer.wordpress.com/docs/developer-tools/github-deployments/"
								target="_blank"
								rel="noopener noreferrer"
								onClick={ handleGithubClick }
							>
								{ translate( 'Connect a repository' ) }
							</Button>
						</div>
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ githubImage } alt={ translate( 'GitHub Deployments' ) } />
					</PageSectionColumns.Column>
				</PageSectionColumns>

				{ /* Telex */ }
				<PageSectionColumns>
					<PageSectionColumns.Column
						heading={
							<span className="dev-tools-overview__heading">
								{ translate( 'Telex' ) }
								<Badge type="info-green">{ translate( 'AI-Powered' ) }</Badge>
							</span>
						}
					>
						<div className="dev-tools-overview__content">
							<div className="dev-tools-overview__description">
								<div className="dev-tools-overview__tagline">
									{ translate( 'Describe it. Build it. Ship it.' ) }
								</div>
								<div>
									{ preventWidows(
										translate(
											'Create custom Gutenberg blocks using natural language. Upload a design, describe what you need, and get a production-ready WordPress block plugin.'
										)
									) }
								</div>
							</div>
							<SimpleList
								className="dev-tools-overview__list"
								items={ [
									translate( 'Describe what you need in plain English' ),
									translate( 'Upload a design and generate matching blocks' ),
									translate( 'Download production-ready block plugins' ),
									translate( 'Build blocks in 7 languages' ),
									translate( 'Track changes with built-in version control' ),
								] }
							/>
							<Button
								__next40pxDefaultSize
								variant="primary"
								href="https://telex.automattic.ai/"
								target="_blank"
								rel="noopener noreferrer"
								onClick={ handleTelexClick }
							>
								{ translate( 'Try Telex' ) }
							</Button>
						</div>
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ telexImage } alt={ translate( 'Telex' ) } />
					</PageSectionColumns.Column>
				</PageSectionColumns>
			</LayoutBody>
		</Layout>
	);
}
