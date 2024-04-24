import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface UpgradeButtonProps {
	goToCheckoutWithPlan: ( planSlug: string ) => void;
	isEntrepreneurTrial?: boolean;
}

const UpgradeButton = ( { goToCheckoutWithPlan, isEntrepreneurTrial }: UpgradeButtonProps ) => {
	const translate = useTranslate();
	const label = isEntrepreneurTrial
		? translate( 'Add payment method' )
		: translate( 'Upgrade now' );

	return (
		<Button
			className={ classNames( 'trial-current-plan__trial-card-cta', {
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
