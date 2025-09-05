const NoteIcon = ( { icon, size = 40 }: { icon: string; size?: number } ) => {
	return (
		<img
			src={ icon }
			alt=""
			width={ size }
			height={ size }
			loading="lazy"
			style={ { width: size, height: size, minWidth: size, borderRadius: '50%' } }
		/>
	);
};

export default NoteIcon;
