import { __ } from '@wordpress/i18n';
import { Progress } from '@wordpress/ui';
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
			<Progress.Root
				aria-label={ __( 'Loading…' ) }
				value={ progress ?? null }
				className="wpcom__loading-progress-bar"
			>
				<Progress.Track>
					<Progress.Indicator />
				</Progress.Track>
			</Progress.Root>
			{ subtitle && <p className="wpcom__loading-subtitle">{ subtitle }</p> }
		</div>
	);
};

export default Loading;
