import PropTypes from 'prop-types';
import './style.scss';

const StatsPeriodHeader = ( { children, className = '' } ) => {
	return <div className={ `stats__period-header ${ className }`.trim() }>{ children }</div>;
};

StatsPeriodHeader.propTypes = {
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};

export default StatsPeriodHeader;
