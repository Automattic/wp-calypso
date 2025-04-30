import { BaseControl, useBaseControlProps } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { IconBad, IconGood, IconNeutral } from './icons';

import './style.scss';

export enum Experience {
	GOOD = 'good',
	NEUTRAL = 'neutral',
	BAD = 'bad',
}

type ExperienceOption = {
	value: Experience;
	icon: JSX.Element;
	ariaLabel: string;
};

interface ExperienceControlOptionProps {
	className?: string;
	checked: boolean;
	onClick: () => void;
	children: React.ReactNode;
	value: string;
	name: string;
	ariaLabel: string;
}

const ExperienceControlOption = ( {
	className,
	checked,
	onClick,
	children,
	value,
	name,
	ariaLabel,
}: ExperienceControlOptionProps ) => (
	<label
		className={ clsx( 'experience-control__option', className, {
			'is-selected': checked,
		} ) }
	>
		<input
			type="radio"
			className="experience-control__radio"
			checked={ checked }
			onChange={ onClick }
			value={ value }
			name={ name }
			aria-label={ ariaLabel }
		/>
		<div className="experience-control__option-content">{ children }</div>
	</label>
);

interface ExperienceControlBaseProps {
	children: React.ReactNode;
	label?: string;
	help?: string;
}

const ExperienceControlBase = ( { children, ...props }: ExperienceControlBaseProps ) => {
	const { baseControlProps } = useBaseControlProps( props );

	return (
		<BaseControl className="experience-control" { ...baseControlProps }>
			<div className="experience-control__options" role="radiogroup">
				{ children }
			</div>
		</BaseControl>
	);
};

interface ExperienceControlProps {
	label: string;
	onChange: ( experience: Experience ) => void;
	value: Experience;
	help?: string;
}

export function ExperienceControl( { label, onChange, value, help }: ExperienceControlProps ) {
	const translate = useTranslate();

	const options: ExperienceOption[] = [
		{
			value: Experience.GOOD,
			icon: <IconGood />,
			ariaLabel: translate( 'Rate as good experience' ),
		},
		{
			value: Experience.NEUTRAL,
			icon: <IconNeutral />,
			ariaLabel: translate( 'Rate as neutral experience' ),
		},
		{
			value: Experience.BAD,
			icon: <IconBad />,
			ariaLabel: translate( 'Rate as bad experience' ),
		},
	];

	const radioGroupName = `experience-control-${ label.toLowerCase().replace( /\s+/g, '-' ) }`;

	return (
		<ExperienceControlBase label={ label } help={ help }>
			{ options.map( ( option ) => (
				<ExperienceControlOption
					key={ option.value }
					className={ `is-${ option.value }` }
					checked={ value === option.value }
					onClick={ () => onChange( option.value ) }
					value={ option.value }
					name={ radioGroupName }
					ariaLabel={ option.ariaLabel }
				>
					{ option.icon }
				</ExperienceControlOption>
			) ) }
		</ExperienceControlBase>
	);
}

ExperienceControl.Base = ExperienceControlBase;
ExperienceControl.Option = ExperienceControlOption;

export default ExperienceControl;
