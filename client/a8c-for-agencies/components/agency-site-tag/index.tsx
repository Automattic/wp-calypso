import { Icon, closeSmall } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';

import './style.scss';

interface Props {
	tag: string;
	onRemoveTag: ( tag: string ) => void;
	isRemovable?: boolean;
}

export default function AgencySiteTag( { tag, onRemoveTag, isRemovable = true }: Props ) {
	return (
		<span className="agency-site-tag">
			<Badge intent="informational">{ tag }</Badge>
			{ isRemovable && (
				<Icon
					className="agency-site-tag__close"
					onClick={ () => onRemoveTag( tag ) }
					icon={ closeSmall }
				/>
			) }
		</span>
	);
}
