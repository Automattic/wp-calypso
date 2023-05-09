import { CSSProperties } from 'react';
import './style.scss';

interface DoughnutChartProps {
	progress: number;
	text: string;
}

interface CustomPercentageVariable extends CSSProperties {
	'--percentage': number;
}

const DoughnutChart = ( props: DoughnutChartProps ) => {
	const { progress, text } = props;

	const style: CustomPercentageVariable = { '--percentage': progress * 100 };

	return (
		<div className="doughnut-chart__wrapper" style={ style }>
			{ text }
		</div>
	);
};

export default DoughnutChart;
