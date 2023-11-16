import { CountryListItem, ManagedContactDetails } from '@automattic/wpcom-checkout';
import TaxFields from 'calypso/my-sites/checkout/src/components/tax-fields';

export function GSuiteFields( {
	taxInfo,
	countriesList,
	onChange,
	isDisabled,
}: {
	taxInfo: ManagedContactDetails;
	countriesList: CountryListItem[];
	onChange: ( taxInfo: ManagedContactDetails ) => void;
	isDisabled?: boolean;
} ) {
	return (
		<div className="g-apps-fieldset">
			<TaxFields
				section="gsuite-contact-step"
				taxInfo={ taxInfo }
				countriesList={ countriesList }
				onChange={ onChange }
				isDisabled={ isDisabled }
			/>
		</div>
	);
}
