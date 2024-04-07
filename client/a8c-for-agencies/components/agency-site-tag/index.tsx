import { Badge } from '@automattic/components';
import { Icon, closeSmall } from '@wordpress/icons';
import './style.scss';

interface Props {
	tag: string;
	onRemoveTag: ( tag: string ) => void;
}

export default function AgencySiteTag( { tag, onRemoveTag }: Props ) {
	return (
		<Badge className="agency-site-tag" type="info">
			<span className="agency-site-tag__text">{ tag }</span>
			<Icon
				className="agency-site-tag__close"
				onClick={ () => onRemoveTag( tag ) }
				icon={ closeSmall }
			/>
		</Badge>
	);
}
