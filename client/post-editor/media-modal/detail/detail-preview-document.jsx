import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export default class extends React.Component {
	static displayName = 'EditorMediaModalDetailPreviewDocument';

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const classes = classNames( this.props.className, 'is-document' );

		return (
			<div className={ classes }>
				<Gridicon icon="pages" size={ 120 } />
			</div>
		);
	}
}
