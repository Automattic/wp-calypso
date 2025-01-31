import { Badge } from '@automattic/components';
import clsx from 'clsx';
import { preventWidows } from 'calypso/lib/formatting';
import './goals-first-design-choice.scss';

interface Props {
	className?: string;
	title: string;
	description: string;
	bgImageSrc?: string;
	fgImageSrc?: string;
	destination: string;
	onSelect: ( destination: string ) => void;
	badgeLabel?: React.ReactElement | string | number;
}

const GoalsFirstDesignChoice = ( {
	className,
	title,
	description,
	bgImageSrc,
	fgImageSrc,
	destination,
	onSelect,
	badgeLabel,
}: Props ) => (
	<button
		className={ clsx( 'goals-first-design-choice', className ) }
		aria-label={ title }
		onClick={ () => onSelect( destination ) }
	>
		<div className="goals-first-design-choice__content">
			<div className="goals-first-design-choice__background">
				{ badgeLabel && (
					<Badge type="info-blue" className="goals-first-design-choice__price-badge">
						{ badgeLabel }
					</Badge>
				) }
				<div className="goals-first-design-choice__background-item">
					{ bgImageSrc && <img src={ bgImageSrc } alt={ title } /> }
					{ fgImageSrc && (
						<img
							className="goals-first-design-choice__foreground-image"
							src={ fgImageSrc }
							alt={ title }
						/>
					) }
				</div>
			</div>
			<div className="goals-first-design-choice__foreground">
				<div className="goals-first-design-choice__title">{ title }</div>
				<div className="goals-first-design-choice__description">
					{ preventWidows( description ) }
				</div>
			</div>
		</div>
	</button>
);

export default GoalsFirstDesignChoice;
