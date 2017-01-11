import React, { PropTypes } from 'react';
import omit from 'lodash.omit';
import classNames from 'classnames';

export default class FormDateInput extends React.Component {
	propTypes: {
		isError: PropTypes.bool,
	}

	render() {
		let otherProps = omit( this.props, [ 'className', 'type' ] );

		const classes = classNames(
			this.props.className,
			{
				'form-date-input': true,
				'is-error': this.props.isError,
			}
		);

		return (
			<input { ...otherProps } type={ 'date' } className={ classes } />
		);
	}
}
