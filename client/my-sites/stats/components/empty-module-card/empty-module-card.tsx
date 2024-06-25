import clsx from 'clsx';
import s from './styles.module.scss';

type EmptyModuleCardProps = {
	className?: string;
	icon?: React.ReactNode;
	description?: string;
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
		<div className={ clsx( className, s[ 'stats-empty-module-card' ] ) }>
			<div className={ s[ 'stats-empty-module-card__icon' ] }>{ icon }</div>
			<div className={ s[ 'stats-empty-module-card__content' ] }>
				<div className={ s[ 'stats-empty-module-card__description' ] }>{ description }</div>
				<div className={ s[ 'stats-empty-module-card__cards' ] }>{ cards }</div>
				{ children }
			</div>
		</div>
	);
};

export default EmptyModuleCard;
