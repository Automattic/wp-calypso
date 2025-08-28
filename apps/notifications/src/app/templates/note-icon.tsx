const NoteIcon = ( { icon, size = 48 }: { icon: string; size?: number } ) => {
	return (
		<img
			src={ icon }
			alt=""
			width={ size }
			height={ size }
			loading="lazy"
			style={ { width: size, height: size, minWidth: size } }
		/>
	);
};

export default NoteIcon;
