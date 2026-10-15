import { FormTokenField } from '@wordpress/components';
import { useEffect, useRef, type ComponentProps } from 'react';

export type TokenItem = Exclude<
	NonNullable< ComponentProps< typeof FormTokenField >[ 'value' ] >[ number ],
	string
>;

type Props = {
	onChange: ( selectedItems: ( string | TokenItem )[] ) => void;
	suggestions: string[];
	value: string[];
	label?: string;
};

const FormTokenFieldWrapper = ( { onChange, suggestions, value, label = '' }: Props ) => {
	const formTokenFieldRef = useRef< HTMLDivElement >( null );

	// Hack to disable the Chrome browser field autocomplete. FormTokenField hardcode it to 'off' but Chrome ignores it.
	useEffect( () => {
		if ( formTokenFieldRef.current ) {
			const inputElement = formTokenFieldRef.current.querySelector( 'input' );
			if ( inputElement ) {
				inputElement.setAttribute( 'autocomplete', 'none' );
			}
		}
	}, [] );

	return (
		<div ref={ formTokenFieldRef }>
			<FormTokenField
				__experimentalAutoSelectFirstMatch
				__experimentalExpandOnFocus
				__experimentalShowHowTo={ false }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ label }
				onChange={ onChange }
				suggestions={ suggestions }
				value={ value }
			/>
		</div>
	);
};

export default FormTokenFieldWrapper;
