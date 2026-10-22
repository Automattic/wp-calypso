import { __ } from '@wordpress/i18n';
import { Choice } from './choices';
import CreateIllustration from './create-illustration';
import FeatureChecklist from './feature-checklist';

export default function CreateChoices( {
	onDevelopment,
	onProduction,
}: {
	onDevelopment: () => void;
	onProduction: () => void;
} ) {
	const options = [
		{
			kind: 'development' as const,
			title: __( 'Development site' ),
			badge: __( 'Free' ),
			description: __( 'Build and share a client preview. Upgrade when you’re ready to launch.' ),
			onClick: onDevelopment,
		},
		{
			kind: 'production' as const,
			title: __( 'Production site' ),
			badge: __( 'Paid' ),
			description: __( 'Set up a client website with paid hosting, ready for its own domain.' ),
			onClick: onProduction,
		},
	];

	return (
		<div className="agency-site-wizard__choices agency-site-wizard__entry-options">
			{ options.map( ( option ) => (
				<div className="agency-site-wizard__entry-option" key={ option.kind }>
					<Choice
						illustration={ <CreateIllustration kind={ option.kind } /> }
						title={ option.title }
						badge={ option.badge }
						description={ option.description }
						onClick={ option.onClick }
					/>
					<FeatureChecklist
						title={ option.title }
						features={ [
							{
								label: __( 'Free while you build' ),
								included: option.kind === 'development',
								detail:
									option.kind === 'development'
										? __(
												'Build and share a client preview on a free development site. Upgrade to paid hosting when you’re ready to launch.'
											)
										: __(
												'Production sites use paid hosting from the start. Choose a development site if you’d like to build a free preview first.'
											),
							},
							{
								label: __( 'WordPress.com hosting' ),
								detail:
									option.kind === 'development'
										? __(
												'Your development site runs on WordPress.com. When the project is ready, upgrade its hosting plan to launch.'
											)
										: __(
												'Choose a WordPress.com hosting plan for this site, with backups, staging, and support included.'
											),
							},
							{
								label: __( 'Pressable hosting' ),
								included: option.kind === 'production',
								detail:
									option.kind === 'development'
										? __(
												'Free development sites in this flow use WordPress.com. Choose a production site to set up hosting on Pressable.'
											)
										: __(
												'Create a site on Pressable, with the option to host multiple client sites on a shared plan.'
											),
							},
							{
								label: __( 'Launch on your domain' ),
								included: option.kind === 'production',
								detail:
									option.kind === 'development'
										? __(
												'Share a preview while you build. Upgrade to a paid hosting plan to connect your client’s domain and launch.'
											)
										: __(
												'Connect your client’s domain and publish whenever the site is ready. You can finish building before making it public.'
											),
							},
						] }
					/>
				</div>
			) ) }
		</div>
	);
}
