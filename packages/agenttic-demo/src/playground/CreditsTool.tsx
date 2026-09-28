import React, { useId } from 'react';
import { ToolDropdown } from './ToolDropdown';
import type { DemoCreditsPlan } from '../hooks/useDemoCredits';

const PLANS: Array< { id: DemoCreditsPlan; label: string } > = [
	{ id: 'none', label: 'None' },
	{ id: 'free', label: 'Free' },
	{ id: 'paid', label: 'Paid' },
];

const PRESETS = [ 100, 55, 15, 0 ];

interface CreditsToolProps {
	plan: DemoCreditsPlan;
	percent: number;
	onPlanChange: ( plan: DemoCreditsPlan ) => void;
	onPercentChange: ( percent: number ) => void;
}

/**
 * View tool for the mocked credits state: plan (none/free/paid) and the
 * remaining percentage, with presets for the states in the design spec.
 * @param props                 Component props.
 * @param props.plan
 * @param props.percent
 * @param props.onPlanChange
 * @param props.onPercentChange
 */
export function CreditsTool( { plan, percent, onPlanChange, onPercentChange }: CreditsToolProps ) {
	const radioName = useId();
	const sliderId = useId();

	return (
		<ToolDropdown label={ plan === 'none' ? 'Credits' : `Credits · ${ percent }%` }>
			<div className="credits-tool">
				<div className="suggestions-tool" role="radiogroup" aria-label="Plan">
					{ PLANS.map( ( option ) => (
						<label
							key={ option.id }
							className="suggestions-tool__option"
							htmlFor={ `${ radioName }-${ option.id }` }
						>
							<input
								id={ `${ radioName }-${ option.id }` }
								type="radio"
								name={ radioName }
								checked={ plan === option.id }
								onChange={ () => onPlanChange( option.id ) }
							/>
							{ option.label }
						</label>
					) ) }
				</div>
				<label className="credits-tool__slider" htmlFor={ sliderId }>
					<span>{ percent }% left</span>
					<input
						id={ sliderId }
						type="range"
						min={ 0 }
						max={ 100 }
						step={ 1 }
						value={ percent }
						disabled={ plan === 'none' }
						onChange={ ( event ) => onPercentChange( Number( event.target.value ) ) }
					/>
				</label>
				<div className="credits-tool__presets">
					{ PRESETS.map( ( preset ) => (
						<button
							key={ preset }
							type="button"
							className="playground-tool"
							aria-pressed={ percent === preset }
							disabled={ plan === 'none' }
							onClick={ () => onPercentChange( preset ) }
						>
							{ preset }%
						</button>
					) ) }
				</div>
			</div>
		</ToolDropdown>
	);
}
