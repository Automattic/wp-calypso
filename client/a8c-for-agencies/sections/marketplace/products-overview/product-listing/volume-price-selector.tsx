import { useTranslate } from 'i18n-calypso';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';

type Props = {
	onBundleSizeChange: ( value: number ) => void;
	availableBundleSizes: number[];
	selectedBundleSize: number;
};

const getDiscountPercentage = ( bundleSize: number ) => {
	// FIXME: Need to calculate based on average discount per bundle size.
	return {
		1: '',
		5: '10%',
		10: '15%',
		20: '20%',
		50: '40%',
		100: '50%',
	}[ bundleSize ];
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
			sub: getDiscountPercentage( size ),
			value: size,
		};
	} );

	const onChange = ( { value }: Option ) => {
		onBundleSizeChange( value as number );
	};

	return (
		<A4ASlider
			label={ translate( 'Volume pricing' ) }
			sub={ translate( 'Save up to' ) }
			className="product-listing__volume-price-selector"
			value={ options.findIndex( ( { value } ) => selectedBundleSize === value ) }
			options={ options }
			onChange={ onChange }
		/>
	);
}
