import { __ } from '@wordpress/i18n';
import { globe, pages, people } from '@wordpress/icons';
import ChoiceFacts from './choice-facts';
import { Choice } from './choices';
import EntryIllustration from './entry-illustration';

export default function EntryChoices( {
	onConnect,
	onMove,
	onCreate,
}: {
	onConnect: () => void;
	onMove: () => void;
	onCreate: () => void;
} ) {
	const options = [
		{
			kind: 'connect' as const,
			title: __( 'Connect a site' ),
			description: __(
				'Keep your current hosting and manage your WordPress sites in one dashboard.'
			),
			onClick: onConnect,
		},
		{
			kind: 'move' as const,
			title: __( 'Move a site' ),
			description: __(
				'Move to WordPress.com or Pressable hosting, on your own or with our help.'
			),
			onClick: onMove,
		},
		{
			kind: 'create' as const,
			title: __( 'Create a site' ),
			description: __(
				'Start a free development site, or choose paid hosting for your next project.'
			),
			onClick: onCreate,
		},
	];

	return (
		<div className="agency-site-wizard__choices agency-site-wizard__entry-options">
			{ options.map( ( option ) => (
				<div className="agency-site-wizard__entry-option" key={ option.kind }>
					<Choice
						illustration={ <EntryIllustration kind={ option.kind } /> }
						title={ option.title }
						description={ option.description }
						onClick={ option.onClick }
					/>
					<ChoiceFacts
						title={ option.title }
						facts={ [
							{
								icon: globe,
								label: {
									connect: __( 'Stays with its current host' ),
									move: __( 'Moves to WordPress.com or Pressable' ),
									create: __( 'New WordPress.com or Pressable hosting' ),
								}[ option.kind ],
							},
							{
								icon: pages,
								label: {
									connect: __( 'Add many sites at once' ),
									move: __( 'Move many sites at once' ),
									create: __( 'One site at a time' ),
								}[ option.kind ],
							},
							{
								icon: people,
								label: {
									connect: __( 'Guided plugin setup' ),
									move: __( 'We can do the move for you' ),
									create: __( 'Free development site while you build' ),
								}[ option.kind ],
							},
						] }
					/>
				</div>
			) ) }
		</div>
	);
}
