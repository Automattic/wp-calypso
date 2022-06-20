import { Button } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useGoals } from './goals';
import ImportLink from './import-link';
import SelectCard from './select-card';

type SelectGoalsProps = {
	onChange: ( selectedGoals: Onboard.SiteGoal[] ) => void;
	onSubmit: ( selectedGoals: Onboard.SiteGoal[] ) => void;
	selectedGoals: Onboard.SiteGoal[];
};

const SiteGoal = Onboard.SiteGoal;

export const SelectGoals: React.FC< SelectGoalsProps > = ( {
	onChange,
	onSubmit,
	selectedGoals,
} ) => {
	const translate = useTranslate();
	const goalOptions = useGoals();

	const handleChange = ( selected: boolean, goal: Onboard.SiteGoal ) => {
		// Always remove potential duplicates
		const newSelectedGoals = [ ...selectedGoals ];

		// Add newly selected goal to the array
		if ( selected ) {
			newSelectedGoals.push( goal );
		} else {
			const goalIndex = newSelectedGoals.indexOf( goal );
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
				<ImportLink onClick={ () => onSubmit( [ ...selectedGoals, SiteGoal.Import ] ) } />
				<Button primary onClick={ () => onSubmit( [ ...selectedGoals ] ) }>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default SelectGoals;
