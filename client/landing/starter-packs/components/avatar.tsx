import { Icon, people } from '@wordpress/icons';
import { useState } from 'react';

interface AvatarProps {
	src: string;
	alt: string;
	size?: number;
	className?: string;
}

export default function Avatar( { src, alt, size = 48, className = '' }: AvatarProps ) {
	const [ hasError, setHasError ] = useState( false );

	if ( ! src || hasError ) {
		return (
			<span
				className={ `avatar avatar--default ${ className }` }
				style={ { width: size, height: size } }
			>
				<Icon icon={ people } size={ Math.round( size * 0.55 ) } />
			</span>
		);
	}

	return (
		<img
			src={ src }
			alt={ alt }
			className={ `avatar ${ className }` }
			style={ { width: size, height: size } }
			onError={ () => setHasError( true ) }
		/>
	);
}
