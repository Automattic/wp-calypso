import { Button } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useGoals } from './goals';
import SelectCard from './select-card';

type SelectGoalsProps = {
	onChange: ( selectedGoals: Onboard.SiteGoal[] ) => void;
	onSubmit: () => void;
	selectedGoals: Onboard.SiteGoal[];
};

export const SelectGoals: React.FC< SelectGoalsProps > = ( {
	onChange,
	onSubmit,
	selectedGoals,
} ) => {
	const translate = useTranslate();
	const goalOptions = useGoals();

	const handleChange = ( selected: boolean, value: Onboard.SiteGoal ) => {
		const newSelectedGoals = [ ...selectedGoals ];
		const goalKey = value;

		if ( selected ) {
			newSelectedGoals.push( goalKey );
		} else {
			const goalIndex = newSelectedGoals.indexOf( goalKey );
			newSelectedGoals.splice( goalIndex, 1 );
		}

		onChange( newSelectedGoals );
	};

	return (
		<>
			<div className="select-goals__cards-container">
				{ goalOptions.map( ( { key, title, isPremium } ) => (
					<SelectCard
						key={ key }
						onChange={ handleChange }
						selected={ selectedGoals.includes( key ) }
						value={ key }
					>
						<span className="select-goals__goal-title">{ title }</span>
						{ isPremium && (
							<span className="select-goals__premium-badge">{ translate( 'Premium' ) }</span>
						) }
					</SelectCard>
				) ) }
			</div>

			<div className="select-goals__actions-container">
				<Button primary onClick={ onSubmit }>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default SelectGoals;
