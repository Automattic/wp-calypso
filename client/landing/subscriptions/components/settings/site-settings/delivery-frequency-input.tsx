import { Reader, SubscriptionManager } from '@automattic/data-stores';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';

type DeliveryFrequencyOptionProps = {
	children: React.ReactNode;
	value: Reader.EmailDeliveryFrequency;
	selected: boolean;
	onChange: ( value: Reader.EmailDeliveryFrequency ) => void;
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
	onChange: ( value: Reader.EmailDeliveryFrequency ) => void;
	value: Reader.EmailDeliveryFrequency;
	isUpdating: boolean;
};

type DeliveryFrequencyKeyLabel = {
	key: Reader.EmailDeliveryFrequency;
	label: string;
};

const DeliveryFrequencyInput = ( {
	onChange,
	value: selectedValue,
	isUpdating,
}: DeliveryFrequencyInputProps ) => {
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const translate = useTranslate();
	const availableFrequencies = useMemo< DeliveryFrequencyKeyLabel[] >(
		() => [
			{
				key: Reader.EmailDeliveryFrequency.Instantly,
				label: translate( 'Instantly' ),
			},
			{
				key: Reader.EmailDeliveryFrequency.Daily,
				label: translate( 'Daily' ),
			},
			{
				key: Reader.EmailDeliveryFrequency.Weekly,
				label: translate( 'Weekly' ),
			},
		],
		[ translate ]
	);

	return (
		<div
			className={ classNames( 'setting-item', 'delivery-frequency-input', {
				'is-logged-in': isLoggedIn,
			} ) }
		>
			{ ! isLoggedIn && (
				<p className="setting-item__label">{ translate( 'Email me new posts' ) }</p>
			) }
			<SegmentedControl
				className={ classNames( 'delivery-frequency-input__control', {
					'is-loading': isUpdating,
				} ) }
			>
				{ availableFrequencies.map( ( { key, label }, index ) => (
					<DeliveryFrequencyOption
						selected={ selectedValue === key }
						value={ key }
						onChange={ onChange }
						key={ index }
					>
						{ label }
					</DeliveryFrequencyOption>
				) ) }
			</SegmentedControl>
		</div>
	);
};

export default DeliveryFrequencyInput;
