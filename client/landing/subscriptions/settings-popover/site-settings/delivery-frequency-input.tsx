import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import type { SiteSubscriptionDeliveryFrequency } from '@automattic/data-stores/src/reader/types';

type DeliveryFrequencyOptionProps = {
	children: React.ReactNode;
	value: SiteSubscriptionDeliveryFrequency;
	selected: boolean;
	onChange: ( value: SiteSubscriptionDeliveryFrequency ) => void;
};

const DeliveryFrequencyOption = ( {
	children,
	selected,
	value,
	onChange,
}: DeliveryFrequencyOptionProps ) => (
	<SegmentedControl.Item selected={ selected } onClick={ () => onChange( value ) }>
		{ children }
	</SegmentedControl.Item>
);

type DeliveryFrequencyInputProps = {
	onChange: ( value: SiteSubscriptionDeliveryFrequency ) => void;
	value: SiteSubscriptionDeliveryFrequency;
};

type DeliveryFrequencyKeyLabel = {
	key: SiteSubscriptionDeliveryFrequency;
	label: string;
};

const DeliveryFrequencyInput = ( {
	onChange,
	value: selectedValue,
}: DeliveryFrequencyInputProps ) => {
	const translate = useTranslate();
	const availableFrequencies = useMemo< DeliveryFrequencyKeyLabel[] >(
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
				<DeliveryFrequencyOption
					selected={ selectedValue === key }
					value={ key }
					onChange={ onChange }
				>
					{ label }
				</DeliveryFrequencyOption>
			) ) }
		</SegmentedControl>
	);
};

export default DeliveryFrequencyInput;
