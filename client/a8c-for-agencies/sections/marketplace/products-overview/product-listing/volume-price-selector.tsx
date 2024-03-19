import { useTranslate } from 'i18n-calypso';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';

type Props = {
	onBundleSizeChange: ( value: number ) => void;
	availableBundleSizes: number[];
	selectedBundleSize: number;
};

export default function VolumePriceSelector( {
	availableBundleSizes,
	onBundleSizeChange,
	selectedBundleSize,
}: Props ) {
	const translate = useTranslate();

	const options = availableBundleSizes.map( ( size ) => {
		return {
			label: `${ size }`,
			value: size,
		};
	} );

	const onChange = ( { value }: Option ) => {
		onBundleSizeChange( value as number );
	};

	return (
		<A4ASlider
			label={ translate( 'Volume pricing' ) }
			className="product-listing__volume-price-selector"
			value={ options.findIndex( ( { value } ) => selectedBundleSize === value ) }
			options={ options }
			onChange={ onChange }
		/>
	);
}
