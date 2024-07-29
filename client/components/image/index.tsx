import clsx from 'clsx';
import { SyntheticEvent } from 'react';

const hideImageOnError = ( event: SyntheticEvent< HTMLImageElement > ) => {
	event.currentTarget.style.display = 'none';
};

type ImageProps = React.ComponentPropsWithoutRef< 'img' >;

export default function Image( { alt, className, src, ...rest }: ImageProps ) {
	return (
		<img
			src={ src }
			onError={ hideImageOnError }
			className={ clsx( className, 'image' ) }
			alt={ alt }
			{ ...rest }
		/>
	);
}
