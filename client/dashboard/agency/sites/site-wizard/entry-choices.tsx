import { __ } from '@wordpress/i18n';
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
			description: __( 'Add sites where they’re hosted today, using a plugin.' ),
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
				<Choice
					key={ option.kind }
					cta
					illustration={ <EntryIllustration kind={ option.kind } /> }
					title={ option.title }
					description={ option.description }
					onClick={ option.onClick }
				/>
			) ) }
		</div>
	);
}
