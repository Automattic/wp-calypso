import classnames from 'classnames';
import { SyntheticEvent } from 'react';

const hideImageOnError = ( event: SyntheticEvent< HTMLImageElement > ) => {
	event.currentTarget.style.display = 'none';
};

export default function Image( { alt, className, src, ...rest }: ImageProps ) {
	return (
		<img
			src={ src }
			onError={ hideImageOnError }
			className={ classnames( className, 'image' ) }
			alt={ alt }
			{ ...rest }
		/>
	);
}

type ImageProps = {
	alt?: string;
	className?: string;
	src: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[ x: string ]: any;
};
