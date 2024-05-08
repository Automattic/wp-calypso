import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface UpgradeButtonProps {
	goToCheckoutWithPlan: ( planSlug: string ) => void;
	isEntrepreneurTrial?: boolean;
}

const UpgradeButton = ( { goToCheckoutWithPlan, isEntrepreneurTrial }: UpgradeButtonProps ) => {
	const translate = useTranslate();
	const label = isEntrepreneurTrial
		? translate( 'Complete your plan purchase' )
		: translate( 'Upgrade now' );

	return (
		<Button
			className={ clsx( 'plans-upgrade-button__button', {
				[ 'blue' ]: isEntrepreneurTrial,
			} ) }
			primary
			onClick={ () => goToCheckoutWithPlan( 'card' ) }
		>
			{ label }
		</Button>
	);
};

export default UpgradeButton;
