import { CSSProperties } from 'react';
import './style.scss';

interface Props {
	progress: number;
	text: string;
}

interface CustomPercentageVariable extends CSSProperties {
	'--percentage': number;
}

const DoughnutChart: React.FunctionComponent< Props > = ( props ) => {
	const { progress, text } = props;

	const style: CustomPercentageVariable = { '--percentage': progress * 100 };

	return (
		<div className="doughnut-chart__wrapper" style={ style }>
			{ text }
		</div>
	);
};

export default DoughnutChart;
