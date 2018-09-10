/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import GridiconPages from 'gridicons/dist/pages';
import classNames from 'classnames';

export default class extends React.Component {
	static displayName = 'EditorMediaModalDetailPreviewDocument';

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const classes = classNames( this.props.className, 'is-document' );

		return (
			<div className={ classes }>
				<GridiconPages size={ 120 } />
			</div>
		);
	}
}
