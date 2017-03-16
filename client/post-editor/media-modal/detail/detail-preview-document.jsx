/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import classNames from 'classnames';

export default React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewDocument',

	propTypes: {
		className: React.PropTypes.string,
	},

	render() {
		const classes = classNames( this.props.className, 'is-document' );

		return (
			<div className={ classes }>
				<Gridicon icon="pages" size={ 120 } />
			</div>
		);
	}
} );
