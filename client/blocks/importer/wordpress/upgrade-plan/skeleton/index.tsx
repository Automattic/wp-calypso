import './style.scss';

interface SkeletonProps {
	width?: number | string;
	height?: number | string;
}

// Borrowed from site-profiler.
export const Skeleton = ( { width = '100%', height = 20 }: SkeletonProps ) => {
	return (
		<div
			className="import-upgrade-plan-skeleton"
			style={ {
				width,
				height,
			} }
		/>
	);
};
