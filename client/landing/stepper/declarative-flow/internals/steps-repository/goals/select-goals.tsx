import { Button } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useGoals } from './goals';
import ImportLink from './import-link';
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

	const handleChange = ( selected: boolean, goal: Onboard.SiteGoal ) => {
		const newSelectedGoals = selected
			? [ ...selectedGoals, goal ]
			: selectedGoals.filter( ( selectedGoal ) => selectedGoal !== goal );
		onChange( newSelectedGoals );
	};

	const handleImportLinkClick = () => {
		// Internally, pick Import as a selected goal.
		// In goalsToIntent(), it will choose import as intent.
		handleChange( true, Onboard.SiteGoal.Import );
		onSubmit();
	};

	const handleSubmit = () => {
		// Omit import from selection if it was added to the selection
		// after user presses back from Import step.
		handleChange( false, Onboard.SiteGoal.Import );
		onSubmit();
	};

	return (
		<>
			<div className="select-goals__cards-container">
				{ goalOptions
					.filter( ( { key } ) => key !== Onboard.SiteGoal.Import )
					.map( ( { key, title, isPremium } ) => (
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
				<ImportLink onClick={ handleImportLinkClick }></ImportLink>
				<Button primary onClick={ handleSubmit }>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default SelectGoals;
