import { Reader, SubscriptionManager } from '@automattic/data-stores';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useMemo } from 'react';
import FormSelect from 'calypso/components/forms/form-select';

type DeliveryFrequencyInputProps = {
	onChange: ( value: Reader.EmailDeliveryFrequency ) => void;
	value: Reader.EmailDeliveryFrequency;
	isUpdating: boolean;
};

type DeliveryFrequencyKeyLabel = {
	value: Reader.EmailDeliveryFrequency;
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
				value: Reader.EmailDeliveryFrequency.Instantly,
				label: translate( 'Instantly' ),
			},
			{
				value: Reader.EmailDeliveryFrequency.Daily,
				label: translate( 'Daily' ),
			},
			{
				value: Reader.EmailDeliveryFrequency.Weekly,
				label: translate( 'Weekly' ),
			},
		],
		[ translate ]
	);

	const selectedFrequency = useMemo< DeliveryFrequencyKeyLabel | undefined >(
		() => availableFrequencies.find( ( option ) => option.value === selectedValue ),
		[ selectedValue, availableFrequencies ]
	);

	return (
		<div
			className={ clsx( 'setting-item', 'delivery-frequency-input', {
				'is-logged-in': isLoggedIn,
			} ) }
		>
			{ ! isLoggedIn && (
				<p className="setting-item__label">{ translate( 'Email me new posts' ) }</p>
			) }
			<FormSelect
				className={ clsx( 'delivery-frequency-input__control', {
					'is-loading': isUpdating,
				} ) }
				value={ selectedFrequency?.value }
				onChange={ ( event: ChangeEvent< HTMLSelectElement > ) =>
					onChange( event.target.value as Reader.EmailDeliveryFrequency )
				}
			>
				{ availableFrequencies.map( ( option ) => (
					<option key={ option.value } value={ option.value }>
						{ option.label }
					</option>
				) ) }
			</FormSelect>
		</div>
	);
};

export default DeliveryFrequencyInput;
