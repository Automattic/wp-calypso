import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { IconBad, IconGood, IconNeutral } from './icons';

import './style.scss';

enum Experience {
	GOOD = 'good',
	NEUTRAL = 'neutral',
	BAD = 'bad',
}

const ExperienceControlOption = ( {
	className,
	isSelected,
	onClick,
	children,
}: {
	className?: string;
	isSelected: boolean;
	onClick: () => void;
	children: React.ReactNode;
} ) => (
	<Button
		className={ clsx( 'experience-control__button', className, {
			'is-selected': isSelected,
		} ) }
		onClick={ onClick }
	>
		<div className="experience-control__button-content">{ children }</div>
	</Button>
);

const ExperienceControlBase = ( {
	label,
	children,
	helpText,
}: {
	label: string;
	children: React.ReactNode;
	helpText?: string;
} ) => (
	<div className="experience-control">
		<div className="experience-control__label">{ label }</div>
		<div className="experience-control__buttons">{ children }</div>
		{ helpText && <div className="experience-control__help-text">{ helpText }</div> }
	</div>
);

export function ExperienceControl( {
	label,
	onChange,
	selectedExperience,
	helpText,
}: {
	label: string;
	onChange: ( experience: string ) => void;
	selectedExperience: string;
	helpText?: string;
} ) {
	const handleChange = ( experience: string ) => {
		onChange( experience );
	};

	const options = [
		{
			value: Experience.GOOD,
			icon: <IconGood />,
		},
		{
			value: Experience.NEUTRAL,
			icon: <IconNeutral />,
		},
		{
			value: Experience.BAD,
			icon: <IconBad />,
		},
	];

	return (
		<ExperienceControlBase label={ label } helpText={ helpText }>
			{ options.map( ( option ) => (
				<ExperienceControlOption
					key={ option.value }
					className={ `is-${ option.value }` }
					isSelected={ selectedExperience === option.value }
					onClick={ () => handleChange( option.value ) }
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
