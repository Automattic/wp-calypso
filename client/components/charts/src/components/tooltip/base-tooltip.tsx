import styles from './base-tooltip.module.scss';
import type { CSSProperties, ComponentType, ReactNode } from 'react';

type TooltipData = {
	label: string;
	value: number;
	valueDisplay?: string;
};

type TooltipComponentProps = {
	data: TooltipData;
	className?: string;
};

type TooltipCommonProps = {
	top: number;
	left: number;
	style?: CSSProperties;
	className?: string;
};

type DefaultDataTooltip = {
	data: TooltipData;
	component?: ComponentType< TooltipComponentProps >;
	children?: never;
};

type CustomTooltip = {
	children: ReactNode;
	data?: never;
	component?: never;
};

type BaseTooltipProps = TooltipCommonProps & ( DefaultDataTooltip | CustomTooltip );

const DefaultTooltipContent = ( { data }: TooltipComponentProps ) => (
	<>
		{ data?.label }: { data?.valueDisplay || data?.value }
	</>
);

export const BaseTooltip = ( {
	data,
	top,
	left,
	component: Component = DefaultTooltipContent,
	children,
	className,
}: BaseTooltipProps ) => {
	return (
		<div className={ styles.tooltip } style={ { top, left } } role="tooltip">
			{ children || <Component data={ data } className={ className } /> }
		</div>
	);
};

export type { BaseTooltipProps, TooltipData };
