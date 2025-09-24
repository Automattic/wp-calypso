import { ComboboxControl } from '@wordpress/components';

export function PerformancePageSelector() {
	const renderItem = ( { item }: ComboboxControlOption ) => {
		return (
			<>
				<div>{ item.value }</div>
				<div>{ item.location }</div>
			</>
		);
	};

	return (
		<ComboboxControl
			__experimentalRenderItem={ renderItem }
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label=""
			allowReset={ false }
			onChange={ () => {} }
			onFilterValueChange={ () => {} }
			options={ [
				{
					location: '/',
					value: 'Home',
					label: 'Home',
				},
				{
					location: '/',
					value: 'Home',
					label: 'Home',
				},
			] }
			value="Home"
		/>
	);
}
