import { Badge } from '@automattic/components';
import { Icon, closeSmall } from '@wordpress/icons';

interface Props {
	tag: string;
	onRemoveTag: ( tag: string ) => void;
}

export default function AgencySiteTag( { tag, onRemoveTag }: Props ) {
	return (
		<Badge type="info">
			{ tag }
			<Icon onClick={ () => onRemoveTag( tag ) } icon={ closeSmall } />
		</Badge>
	);
}
