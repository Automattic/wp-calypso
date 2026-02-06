import { useAgentsManagerContext } from '../../contexts';

interface Props {
	type: 'picker' | 'start-over';
}

/**
 * A message component shown when a tool/feature is unavailable in the current context.
 */
export default function UnavailableToolMessage( { type }: Props ) {
	const { site } = useAgentsManagerContext();

	let content;

	switch ( type ) {
		case 'picker':
			content = site?.domain ? (
				<>
					This feature is only available in the{ ' ' }
					<a
						href={ `https://${ site.domain }/wp-admin/site-editor.php?canvas=edit` }
						rel="noopener noreferrer"
					>
						site editor
					</a>
					.
				</>
			) : (
				'This feature is only available in the site editor.'
			);
			break;
		case 'start-over':
			content = 'Request to start over again.';
			break;
		default:
			content = '';
	}

	return <p>{ content }</p>;
}
