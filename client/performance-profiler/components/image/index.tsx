type ImageProps = {
	src: string;
	alt?: string;
	className?: string;
};
const Image = ( props: ImageProps ) => {
	const { src, alt, className, ...rest } = props;

	return (
		<img
			className={ `performance-profiler-image ${ className }` }
			src={ src }
			alt={ alt }
			{ ...rest }
		/>
	);
};

export default Image;
