import './style.scss';

interface SkeletonProps {
	width?: number | string;
	height?: number | string;
	isShow?: boolean;
}

export const Skeleton = ( { width = '100%', height = 20 }: SkeletonProps ) => {
	return (
		<div
			className="site-profiler-skeleton"
			style={ {
				width,
				height,
			} }
		/>
	);
};
