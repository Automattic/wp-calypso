// Copied and modified from woocommerce: https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce-admin/client/core-profiler/pages/Loader.tsx#L26
// TODO: Remove this once we create a reusable component
import { useState, useEffect } from '@wordpress/element';
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import './woo-loader.scss';

export type Stage = {
	title: string;
	image?: React.ComponentType;
	label: string;
	text: string;
	duration?: number;
	element?: JSX.Element;
	progress: number;
};

export type Stages = Array< Stage >;

type ProgressBarProps = {
	className?: string;
	percent?: number;
	color?: string;
	bgcolor?: string;
};

const ProgressBar = ( {
	className = '',
	percent = 0,
	color = '#674399',
	bgcolor = 'var(--wp-admin-theme-color)',
}: ProgressBarProps ) => {
	const containerStyles = {
		backgroundColor: bgcolor,
	};

	const fillerStyles: HTMLAttributes< HTMLDivElement >[ 'style' ] = {
		backgroundColor: color,
		width: `${ percent }%`,
		display: percent === 0 ? 'none' : 'inherit',
	};

	return (
		<div className={ `jetpack-connect-progress-bar ${ className }` }>
			<div className="jetpack-connect-progress-bar__container" style={ containerStyles }>
				<div className="jetpack-connect-progress-bar__filler" style={ fillerStyles } />
			</div>
		</div>
	);
};

type Props = {
	className: string;
	stages: Stage[];
};

export const WooLoader = ( { className, stages }: Props ) => {
	const [ currentStageIndex, setCurrentStageIndex ] = useState( 0 );
	const stage = stages[ currentStageIndex ];

	useEffect( () => {
		const interval = setInterval(
			() => {
				setCurrentStageIndex( ( _currentStageIndex ) =>
					stages[ _currentStageIndex + 1 ] ? _currentStageIndex + 1 : 0
				);
			},
			stages[ currentStageIndex ]?.duration ?? 3000
		);

		return () => clearInterval( interval );
	}, [ stages, currentStageIndex ] );

	return (
		<div className={ clsx( 'jetpack-connect-woocommerce-loader', className ) }>
			<div className="jetpack-connect-loader-wrapper">
				{ stage.image && <stage.image /> }

				<h1 className="jetpack-connect-loader__title">{ stage.title }</h1>
				<ProgressBar
					className="progress-bar"
					percent={ stage.progress ?? 0 }
					color="var(--wp-admin-theme-color)"
					bgcolor="#E0E0E0"
				/>
				<p className="jetpack-connect-loader__paragraph">
					<b>{ stage?.label } </b>
					{ stage?.text }
					{ stage?.element }
				</p>
			</div>
		</div>
	);
};
