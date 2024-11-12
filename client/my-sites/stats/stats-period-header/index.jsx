import './style.scss';

const StatsPeriodHeader = ( { children, className } ) => {
	return <div className={ `stats__period-header ${ className || '' }` }>{ children }</div>;
};

export default StatsPeriodHeader;
