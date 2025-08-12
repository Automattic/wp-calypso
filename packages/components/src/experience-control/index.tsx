import { BaseControl, useBaseControlProps, VisuallyHidden } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useId } from 'react';
import { IconBad, IconGood, IconNeutral } from './icons';
import type {
	ExperienceValue,
	ExperienceOption,
	ExperienceControlOptionProps,
	ExperienceControlBaseProps,
	ExperienceControlProps,
} from './types';

import './style.scss';

const ExperienceControlOption = ( {
	className,
	icon,
	ariaLabel,
	...restProps
}: ExperienceControlOptionProps ) => (
	<label className={ clsx( 'a8c-experience-control__option', className ) }>
		<VisuallyHidden>
			<input type="radio" aria-label={ ariaLabel } { ...restProps } />
		</VisuallyHidden>
		<div className="a8c-experience-control__option-icon">{ icon }</div>
	</label>
);

const ExperienceControlBase = ( {
	children,
	className,
	hideLabelFromVision,
	label,
	...restProps
}: ExperienceControlBaseProps ) => {
	const { baseControlProps, controlProps } = useBaseControlProps( restProps );

	return (
		<BaseControl
			__nextHasNoMarginBottom
			className={ clsx( 'a8c-experience-control', className ) }
			{ ...baseControlProps }
		>
			<fieldset { ...controlProps } className="a8c-experience-control__fieldset">
				{ hideLabelFromVision ? (
					<VisuallyHidden as="legend">{ label }</VisuallyHidden>
				) : (
					<BaseControl.VisualLabel as="legend">{ label }</BaseControl.VisualLabel>
				) }
				{ children }
			</fieldset>
		</BaseControl>
	);
};

/**
 * A flexible component for collecting user experience feedback through a simple three-state rating system.
 * The component provides an accessible way to gather user sentiment with visual and interactive feedback.
 * @example
 * Usage:
 * ```jsx
 * import { ExperienceControl } from '@automattic/components';
 * function MyComponent() {
 *   const [ experience, setExperience ] = useState( 'good' );
 *
 *   return (
 *     <ExperienceControl
 *       label="What was your experience like?"
 *       onChange={ setExperience }
 *       value={ experience }
 *     />
 *   );
 * }
 * ```
 * @description
 * - The component is fully accessible with proper ARIA labels and keyboard navigation
 * - Each option (good, neutral, bad) is represented by an icon and can be selected via click or keyboard
 * - The component provides visual feedback for the selected option
 */
export function ExperienceControl( {
	label,
	onChange,
	value,
	help,
	name,
}: ExperienceControlProps ) {
	const { __ } = useI18n();
	const nameId = useId();

	const options: ExperienceOption[] = [
		{
			value: 'good',
			icon: <IconGood />,
			ariaLabel: __( 'Good' ),
		},
		{
			value: 'neutral',
			icon: <IconNeutral />,
			ariaLabel: __( 'Neutral' ),
		},
		{
			value: 'bad',
			icon: <IconBad />,
			ariaLabel: __( 'Bad' ),
		},
	];

	return (
		<ExperienceControlBase label={ label } help={ help }>
			{ options.map( ( option ) => (
				<ExperienceControlOption
					key={ option.value }
					className={ `is-${ option.value }` }
					checked={ value === option.value }
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
						onChange( event.target.value as ExperienceValue )
					}
					value={ option.value }
					name={ name ?? `experience-control-${ nameId }` }
					ariaLabel={ option.ariaLabel }
					icon={ option.icon }
				/>
			) ) }
		</ExperienceControlBase>
	);
}

export default ExperienceControl;
