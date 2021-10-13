import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

import './style.scss';

const noop = () => {};

const BackButton = ( { onClick, translate } ) => {
	return (
		<div className="back-button">
			<Button borderless compact onClick={ onClick }>
				<Gridicon icon="arrow-left" />
				<span className="back-button__label">{ translate( 'Back' ) }</span>
			</Button>
		</div>
	);
};

BackButton.propTypes = {
	onClick: PropTypes.func.isRequired,
};

BackButton.defaultProps = {
	onClick: noop,
};

export default localize( BackButton );
