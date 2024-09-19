import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/heading-has-content */
const StatsPagePlaceholder = ( props ) => (
	<div className={ clsx( 'main is-wide-layout', props.className ) }>
		<Card className="stats-module stats-page-placeholder__header is-loading">
			<div className="module-header">
				<h3 className="module-header-title" />
			</div>
		</Card>
		<Card className="stats-module stats-page-placeholder__content is-loading">
			<div className="module-header">
				<h3 className="module-header-title" />
			</div>
		</Card>
	</div>
);

StatsPagePlaceholder.propTypes = {
	className: PropTypes.string,
};

export default StatsPagePlaceholder;
