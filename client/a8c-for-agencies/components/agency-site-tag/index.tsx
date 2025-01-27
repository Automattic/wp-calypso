import { Badge } from '@automattic/components';
import { Icon, closeSmall } from '@wordpress/icons';
import './style.scss';

interface Props {
	tag: string;
	onRemoveTag: ( tag: string ) => void;
	isRemovable?: boolean;
}

export default function AgencySiteTag( { tag, onRemoveTag, isRemovable = true }: Props ) {
	return (
		<Badge className="agency-site-tag" type="info">
			<span className="agency-site-tag__text">{ tag }</span>
			{ isRemovable && (
				<Icon
					className="agency-site-tag__close"
					onClick={ () => onRemoveTag( tag ) }
					icon={ closeSmall }
				/>
			) }
		</Badge>
	);
}
