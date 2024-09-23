import clsx from 'clsx';
import './styles.scss';

type EmptyModuleCardProps = {
	className?: string;
	icon?: React.ReactNode;
	description?: string | React.ReactNode;
	cards?: React.ReactNode;
	children?: React.ReactNode;
};

const EmptyModuleCard = ( {
	className,
	icon,
	description,
	cards,
	children,
}: EmptyModuleCardProps ) => {
	return (
		<div className={ clsx( className, 'stats-empty-module-card' ) }>
			<div className="stats-empty-module-card__icon">{ icon }</div>
			<div className="stats-empty-module-card__content">
				<div className="stats-empty-module-card__description">{ description }</div>
				<div className="stats-empty-module-card__cards">{ cards }</div>
				{ children }
			</div>
		</div>
	);
};

export default EmptyModuleCard;
