import { Onboard } from 'calypso/../packages/data-stores/src';
import { useGoals } from './goals';
import SelectCard from './select-card';

type SelectGoalsProps = {
	onChange: ( selectedGoals: Onboard.GoalKey[] ) => void;
	selectedGoals: Onboard.GoalKey[];
};

export const SelectGoals: React.FC< SelectGoalsProps > = ( { onChange, selectedGoals } ) => {
	const goals = useGoals();

	const handleChange = ( selected: boolean, value: string ) => {
		const newSelectedGoals = [ ...selectedGoals ];
		const goalKey = value as Onboard.GoalKey;

		if ( selected ) {
			newSelectedGoals.push( goalKey );
		} else {
			const goalIndex = newSelectedGoals.indexOf( goalKey );
			newSelectedGoals.splice( goalIndex, 1 );
		}

		onChange( newSelectedGoals );
	};

	return (
		<div className="select-goals__container">
			{ goals.map( ( goal ) => (
				<SelectCard
					onChange={ handleChange }
					selected={ selectedGoals.includes( goal.key ) }
					value={ goal.key }
				>
					{ goal.title }
					{ goal.isPremium && <span className="select-goals__premium-badge">Premium</span> }
				</SelectCard>
			) ) }
		</div>
	);
};

export default SelectGoals;
