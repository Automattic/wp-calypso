import { Button } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useGoals } from './goals';
import SelectCard from './select-card';

type SelectGoalsProps = {
	onChange: ( selectedGoals: Onboard.SiteGoal[] ) => void;
	onSubmit: ( selectedGoals: Onboard.SiteGoal[] ) => void;
	selectedGoals: Onboard.SiteGoal[];
};

const Placeholder = styled.div`
	padding: 0 60px;
	animation: loading-fade 800ms ease-in-out infinite;
	background-color: var( --color-neutral-10 );
	color: transparent;
	min-height: 20px;
	width: 100%;
	@keyframes loading-fade {
		0% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.5;
		}
	}
`;

const SiteGoal = Onboard.SiteGoal;

export const SelectGoals = ( { onChange, onSubmit, selectedGoals }: SelectGoalsProps ) => {
	const translate = useTranslate();
	const goalOptions = useGoals();

	// *******************************************************************************
	// ****  Experiment skeleton left in for future BBE (Goal) copy change tests  ****
	// *******************************************************************************
	//
	// let [ isBuiltByExpressExperimentLoading ] = useExperiment(
	// 	CALYPSO_BUILTBYEXPRESS_GOAL_TEXT_EXPERIMENT_NAME
	// );
	//
	// *******************************************************************************
	const isBuiltByExpressExperimentLoading = false;

	const addGoal = ( goal: Onboard.SiteGoal ) => {
		const goalSet = new Set( selectedGoals );
		goalSet.add( goal );
		return Array.from( goalSet );
	};

	const removeGoal = ( goal: Onboard.SiteGoal ) => {
		const goalSet = new Set( selectedGoals );
		goalSet.delete( goal );
		return Array.from( goalSet );
	};

	const handleChange = ( selected: boolean, goal: Onboard.SiteGoal ) => {
		const newSelectedGoals = selected ? addGoal( goal ) : removeGoal( goal );
		onChange( newSelectedGoals );
	};

	const handleContinueButtonClick = () => {
		onSubmit( selectedGoals );
	};

	const hasBuiltByExpressGoal = goalOptions.some( ( g ) => g.key === SiteGoal.DIFM );
	return (
		<>
			<div className="select-goals__cards-hint">{ translate( 'Select all that apply' ) }</div>

			<div className="select-goals__cards-container">
				{ /* We only need to show the goal loader only if the BBE goal will be displayed */ }
				{ hasBuiltByExpressGoal && isBuiltByExpressExperimentLoading
					? goalOptions.map( ( { key } ) => (
							<div
								className="select-card__container"
								role="progressbar"
								key={ `goal-${ key }-placeholder` }
								style={ { cursor: 'default' } }
							>
								<Placeholder />
							</div>
					  ) )
					: goalOptions.map( ( { key, title, isPremium } ) => (
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
				<Button primary onClick={ handleContinueButtonClick }>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default SelectGoals;
