import clsx from 'clsx';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import './style.scss';

export default class extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const { children, className } = this.props;
		const gridClassName = clsx( 'tile-grid', className );

		return <div className={ gridClassName }>{ children }</div>;
	}
}
