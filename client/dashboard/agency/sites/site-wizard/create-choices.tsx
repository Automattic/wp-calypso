import { __ } from '@wordpress/i18n';
import { Choice } from './choices';

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
			description: __( 'Build and share a preview. Free until you launch.' ),
			onClick: onDevelopment,
		},
		{
			kind: 'production' as const,
			title: __( 'Production site' ),
			badge: __( 'Paid' ),
			description: __( 'A live client site with paid hosting from day one.' ),
			onClick: onProduction,
		},
	];

	return (
		<div className="agency-site-wizard__choices agency-site-wizard__entry-options">
			{ options.map( ( option ) => (
				<Choice
					key={ option.kind }
					title={ option.title }
					badge={ option.badge }
					description={ option.description }
					onClick={ option.onClick }
				/>
			) ) }
		</div>
	);
}
