import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import githubImage from 'calypso/assets/images/a8c-for-agencies/dev-tools/github-deployments.png';
import studioImage from 'calypso/assets/images/a8c-for-agencies/dev-tools/studio.png';
import telexImage from 'calypso/assets/images/a8c-for-agencies/dev-tools/telex.jpg';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import DevToolSection from './dev-tool-section';

import './style.scss';

export default function DevToolsContent() {
	const dispatch = useDispatch();

	const handleStudioClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_dev_tools_download_studio_click' ) );
	};

	const handleGithubClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_dev_tools_connect_repository_click' ) );
	};

	const handleTelexClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_dev_tools_try_telex_click' ) );
	};

	return (
		<>
			<Text className="dev-tools-overview__intro">
				{ preventWidows(
					__(
						'Everything you need to build, test, and ship client sites faster, from local development to production deployment.'
					)
				) }
			</Text>

			<DevToolSection
				name={ __( 'WordPress Studio' ) }
				badge={ __( 'Open Source' ) }
				tagline={ __( 'Local development, simplified' ) }
				description={ __(
					'Build and test WordPress sites on your machine. No Docker, no MAMP, no configuration files. Just download, launch, and start building.'
				) }
				features={ [
					__( 'Create local sites in one click' ),
					__( 'Pull live sites to test changes safely' ),
					__( 'Push changes directly to production' ),
					__( 'Share demo sites with clients instantly' ),
					__( 'Works on macOS and Windows' ),
				] }
				cta={ {
					label: __( 'Start building locally' ),
					href: 'https://developer.wordpress.com/studio/',
					onClick: handleStudioClick,
				} }
				image={ {
					src: studioImage,
					alt: __( 'WordPress Studio' ),
				} }
			/>

			<DevToolSection
				name={ __( 'GitHub Deployments' ) }
				badge={ __( 'Git-native' ) }
				tagline={ __( 'Push code, deploy automatically' ) }
				description={ __(
					'Connect your GitHub repository directly to WordPress.com. Every push to your deployment branch automatically deploys themes, plugins, or full site changes.'
				) }
				features={ [
					__( 'Deploy on every push to your branch' ),
					__( 'Trigger manual deploys when you need control' ),
					__( 'Track every deployment with full history' ),
					__( 'Choose which branch deploys to production' ),
					__( 'Ship updates without any downtime' ),
				] }
				cta={ {
					label: __( 'Automate your deploys' ),
					href: 'https://developer.wordpress.com/docs/developer-tools/github-deployments/',
					onClick: handleGithubClick,
				} }
				image={ {
					src: githubImage,
					alt: __( 'GitHub Deployments' ),
				} }
				hasBackground
			/>

			<DevToolSection
				name={ __( 'Telex' ) }
				badge={ __( 'AI-Powered' ) }
				tagline={ __( 'Describe it. Build it. Ship it.' ) }
				description={ __(
					'Create custom Gutenberg blocks using natural language. Upload a design, describe what you need, and get a production-ready WordPress block plugin.'
				) }
				features={ [
					__( 'Describe what you need in plain English' ),
					__( 'Upload a design and generate matching blocks' ),
					__( 'Download production-ready block plugins' ),
					__( 'Build blocks in 7 languages' ),
					__( 'Track changes with built-in version control' ),
				] }
				cta={ {
					label: __( 'Create blocks in minutes' ),
					href: 'https://telex.automattic.ai/',
					onClick: handleTelexClick,
				} }
				image={ {
					src: telexImage,
					alt: __( 'Telex' ),
				} }
			/>
		</>
	);
}
