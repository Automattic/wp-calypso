import { Button } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useGoals } from './goals';
import ImportLink from './import-link';
import SelectCard from './select-card';

type SelectGoalsProps = {
	onChange: ( selectedGoals: Onboard.SiteGoal[] ) => void;
	onSubmit: ( selectedGoals: Onboard.SiteGoal[] ) => void;
	selectedGoals: Onboard.SiteGoal[];
};

const SiteGoal = Onboard.SiteGoal;

export const SelectGoals = ( { onChange, onSubmit, selectedGoals }: SelectGoalsProps ) => {
	const translate = useTranslate();
	const goalOptions = useGoals();
	const [ submitting, setSubmitting ] = useState( false );

	const handleChange = ( selected: boolean, goal: Onboard.SiteGoal ) => {
		if ( submitting ) {
			return;
		}

		const newSelectedGoals = new Set( selectedGoals );
		selected ? newSelectedGoals.add( goal ) : newSelectedGoals.delete( goal );
		onChange( Array.from( newSelectedGoals ) );
	};

	const handleSubmit = ( goals: Onboard.SiteGoal[] ) => {
		setSubmitting( true );
		onSubmit( goals );
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
				<ImportLink
					busy={ submitting }
					onClick={ () => {
						if ( ! selectedGoals.includes( SiteGoal.Import ) ) {
							handleSubmit( [ ...selectedGoals, SiteGoal.Import ] );
						}
					} }
				/>
				<Button primary busy={ submitting } onClick={ () => handleSubmit( [ ...selectedGoals ] ) }>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default SelectGoals;
