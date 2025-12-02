import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import './style.scss';

const NoteIcon = ( {
	className,
	icon,
	size = 32,
	alt = '',
	badge = null,
}: {
	className?: string;
	icon?: string;
	size?: number;
	alt?: string;
	badge?: ReactNode;
} ) => {
	const style: CSSProperties = {
		width: size,
		height: size,
		minWidth: size,
	};
	return (
		<div className={ clsx( 'wpnc__note-icon', className ) }>
			{ icon ? (
				<img
					src={ icon }
					alt={ alt }
					width={ size }
					height={ size }
					loading="lazy"
					style={ style }
				/>
			) : (
				<div className="wpnc__note-icon-placeholder" style={ style } />
			) }
			{ badge }
		</div>
	);
};

export default NoteIcon;
