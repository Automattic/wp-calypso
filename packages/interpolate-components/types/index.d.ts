interface InterpolateOptions {
	mixedString: string;
	components?: Record< string, JSX.Element >;
	throwErrors?: boolean;
}

export default function interpolate( options: InterpolateOptions ): JSX.Element;
