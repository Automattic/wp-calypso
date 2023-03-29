import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import { EmailFrequencyType } from '../types';

type EmailFrequencyOptionProps = {
	children: React.ReactNode;
	selected: EmailFrequencyType;
	value: EmailFrequencyType;
	onChange: ( value: EmailFrequencyType ) => void;
};

const EmailFrequencyOption = ( {
	children,
	selected,
	value,
	onChange,
}: EmailFrequencyOptionProps ) => (
	<SegmentedControl.Item selected={ selected === value } onClick={ () => onChange( value ) }>
		{ children }
	</SegmentedControl.Item>
);

type EmailFrequencyProps = {
	onChange: ( value: EmailFrequencyType ) => void;
	value: EmailFrequencyType;
};

type EmailFrequencyKeyLabel = {
	key: EmailFrequencyType;
	label: string;
};

const EmailFrequency = ( { onChange, value: selectedValue }: EmailFrequencyProps ) => {
	const translate = useTranslate();
	const availableFrequencies = useMemo< EmailFrequencyKeyLabel[] >(
		() => [
			{
				key: 'instantly',
				label: translate( 'Instantly' ),
			},
			{
				key: 'daily',
				label: translate( 'Daily' ),
			},
			{
				key: 'weekly',
				label: translate( 'Weekly' ),
			},
		],
		[ translate ]
	);

	return (
		<SegmentedControl>
			{ availableFrequencies.map( ( { key, label } ) => (
				<EmailFrequencyOption selected={ selectedValue } value={ key } onChange={ onChange }>
					{ label }
				</EmailFrequencyOption>
			) ) }
		</SegmentedControl>
	);
};

export default EmailFrequency;
