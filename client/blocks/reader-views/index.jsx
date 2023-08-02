import BarChart from 'calypso/assets/images/icons/bar-chart.svg';
import SVGIcon from 'calypso/components/svg-icon';
import './style.scss';

const ReaderViews = ( { viewCount } ) => {
	return (
		<div className="reader-views">
			<SVGIcon classes="reader-views__icon" name="bar-chart" size="20" icon={ BarChart } />
			<span className="reader-views__view-count">{ viewCount }</span>
		</div>
	);
};

export default ReaderViews;
