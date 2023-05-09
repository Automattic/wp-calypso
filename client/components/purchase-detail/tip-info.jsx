import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import './tip-info.scss';

const TipInfo = ( { info = '', className } ) => {
	const classes = classNames( 'purchase-detail__info', className );
	return (
		<div className={ classes }>
			<Gridicon size={ 12 } icon="info-outline" className="purchase-detail__info-icon" />
			{ info }
		</div>
	);
};

TipInfo.propTypes = {
	info: PropTypes.string,
	className: PropTypes.string,
};

export default TipInfo;
