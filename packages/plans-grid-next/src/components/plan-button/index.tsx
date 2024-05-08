import { getPlanClass, type PlanSlug } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import clsx from 'clsx';
import './style.scss';

// TODO:
// The prop should simply be declared by extending the
// props of Button, instead of listing everything needed like this.
const PlanButton = ( {
	planSlug,
	children,
	classes,
	href,
	onClick = () => {},
	busy = false,
	borderless = false,
	current = false,
	disabled = false,
	isStuck = false,
	isLargeCurrency = false,
}: {
	planSlug?: PlanSlug;
	children: React.ReactNode;
	classes?: string;
	href?: string;
	onClick?: () => void;
	busy?: boolean;
	borderless?: boolean;
	current?: boolean;
	disabled?: boolean;
	isStuck?: boolean;
	isLargeCurrency?: boolean;
} ) => {
	const className = clsx(
		classes,
		'plan-features-2023-grid__actions-button',
		planSlug ? getPlanClass( planSlug ) : 'is-default',
		{
			'is-current-plan': current,
			'is-stuck': isStuck,
			'is-large-currency': isLargeCurrency,
		}
	);

	return (
		<Button
			className={ className }
			onClick={ onClick }
			busy={ busy }
			borderless={ borderless }
			disabled={ disabled }
			href={ href }
		>
			{ children }
		</Button>
	);
};

export default PlanButton;
