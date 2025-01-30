import { Badge } from '@automattic/components';
import clsx from 'clsx';
import { preventWidows } from 'calypso/lib/formatting';
import './design-choice.scss';

interface Props {
	className?: string;
	title: string;
	description: string;
	imageSrc: string;
	destination: string;
	footer?: React.ReactNode;
	onSelect: ( destination: string ) => void;
	badgeLabel?: React.ReactElement | string | number;
}

const DesignChoice = ( {
	className,
	title,
	description,
	imageSrc,
	destination,
	footer,
	onSelect,
	badgeLabel,
}: Props ) => (
	<button
		className={ clsx( 'design-choice', className ) }
		aria-label={ title }
		onClick={ () => onSelect( destination ) }
	>
		<div className="design-choice__title">{ title }</div>
		<div className="design-choice__description">{ preventWidows( description ) }</div>
		<div className="design-choice__image-container">
			{ badgeLabel && (
				<Badge type="info-blue" className="design-choice__price-badge">
					{ badgeLabel }
				</Badge>
			) }
			<img src={ imageSrc } alt={ title } />
			{ footer ? <div className="design-choice__footer">{ footer }</div> : null }
		</div>
	</button>
);

export default DesignChoice;
