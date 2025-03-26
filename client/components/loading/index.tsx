import { ProgressBar } from '@wordpress/components';
import clsx from 'clsx';
import './style.scss';

interface LoadingProps {
	title?: string | React.ReactNode;
	subtitle?: React.ReactNode;
	progress?: number;
	className?: string;
}

const Loading: React.FC< LoadingProps > = ( { title, subtitle, progress, className } ) => {
	return (
		<div className={ clsx( 'wpcom__loading', className ) }>
			<h1 className="wpcom__loading-title">{ title }</h1>
			<ProgressBar value={ progress } className="wpcom__loading-progress-bar" />
			{ subtitle && <p className="wpcom__loading-subtitle">{ subtitle }</p> }
		</div>
	);
};

export default Loading;
