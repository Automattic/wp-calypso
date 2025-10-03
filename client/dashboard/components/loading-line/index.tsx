import './style.scss';

interface LoadingLineProps {
	variant: 'progress' | 'spinner';
	progressDuration: string;
}

export function LoadingLine( { variant, progressDuration }: LoadingLineProps ) {
	const durationStyle = variant === 'progress' ? { animationDuration: progressDuration } : {};
	return (
		<div className={ `loading-line-wrapper is-${ variant }` }>
			<div className="loading-line-bar" style={ durationStyle } />
		</div>
	);
}
