import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';

export default class extends Component {
	static displayName = 'EditorMediaModalDetailPreviewDocument';

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const classes = clsx( this.props.className, 'is-document' );

		return (
			<div className={ classes }>
				{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
				<Gridicon icon="pages" size={ 120 } />
			</div>
		);
	}
}
