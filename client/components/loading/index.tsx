import { ProgressBar } from '@wordpress/components';
import clsx from 'clsx';
import './style.scss';

interface LoadingProps {
	title?: string;
	subtitle?: React.ReactNode;
	progress?: number;
	className?: string;
}

const Loading: React.FC< LoadingProps > = ( { title, subtitle, progress, className } ) => {
	return (
		<div className={ clsx( 'loading', className ) }>
			<h1 className="loading__title">{ title }</h1>
			<ProgressBar value={ progress } className="loading__progress-bar" />
			{ subtitle && <p className="loading__subtitle">{ subtitle }</p> }
		</div>
	);
};

export default Loading;
