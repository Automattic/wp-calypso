import { Icon, closeSmall } from '@wordpress/icons';
import './site-tag.scss';

interface Props {
	id: number;
	onRemoveTag: Function;
	label: string;
}

export default function SiteTag( { id, label, onRemoveTag }: Props ) {
	return (
		<div className="site-tag">
			<span className="site-tag__text">{ label }</span>
			<span className="site-tag__remove">
				<Icon
					onClick={ () => {
						onRemoveTag( id );
					} }
					icon={ closeSmall }
				/>
			</span>
		</div>
	);
}
