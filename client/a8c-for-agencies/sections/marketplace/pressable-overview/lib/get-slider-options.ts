import { PressablePlan } from './get-pressable-plan';

export default function getSliderOptions( type: 'install' | 'visits', plans: PressablePlan[] ) {
	return plans
		.sort( ( planA, planB ) => planA.install - planB.install ) // Ensure our options are sorted by install count
		.map( ( plan ) => {
			return {
				label: `${ type === 'install' ? plan.install : plan.visits }`,
				value: plan.slug,
			};
		} );
}
