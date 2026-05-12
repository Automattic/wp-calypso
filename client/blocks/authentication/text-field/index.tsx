import { TextControl } from '@wordpress/components';
import type { ComponentProps } from 'react';

type WPTextControlProps = ComponentProps< typeof TextControl >;

type TextFieldProps = Omit< WPTextControlProps, 'onChange' | 'value' > & {
	value: string;
	onChange: ( value: string ) => void;
};

const TextField = ( props: TextFieldProps ) => (
	<TextControl __nextHasNoMarginBottom __next40pxDefaultSize { ...props } />
);

export default TextField;
