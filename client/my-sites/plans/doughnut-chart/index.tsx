import clsx from 'clsx';
import { CSSProperties } from 'react';
import './style.scss';

interface DoughnutChartProps {
	progress: number;
	text: string;
	isEntrepreneurTrial?: boolean;
}

interface CustomPercentageVariable extends CSSProperties {
	'--percentage': number;
}

const DoughnutChart = ( props: DoughnutChartProps ) => {
	const { progress, text, isEntrepreneurTrial } = props;

	const style: CustomPercentageVariable = { '--percentage': progress * 100 };

	return (
		<div
			className={ clsx( 'doughnut-chart__wrapper', {
				blue: isEntrepreneurTrial,
			} ) }
			style={ style }
		>
			{ text }
		</div>
	);
};

export default DoughnutChart;
