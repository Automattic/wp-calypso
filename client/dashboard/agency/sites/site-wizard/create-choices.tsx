import { __ } from '@wordpress/i18n';
import { currencyDollar, globe, link } from '@wordpress/icons';
import ChoiceFacts from './choice-facts';
import { Choice } from './choices';
import CreateIllustration from './create-illustration';

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
					<ChoiceFacts
						title={ option.title }
						facts={ [
							{
								icon: currencyDollar,
								label:
									option.kind === 'development'
										? __( 'Free while you build' )
										: __( 'Paid hosting from the start' ),
							},
							{
								icon: globe,
								label:
									option.kind === 'development'
										? __( 'Hosted on WordPress.com' )
										: __( 'WordPress.com or Pressable' ),
							},
							{
								icon: link,
								label:
									option.kind === 'development'
										? __( 'Share a preview link, upgrade to launch' )
										: __( 'Launch on your client’s domain' ),
							},
						] }
					/>
				</div>
			) ) }
		</div>
	);
}
