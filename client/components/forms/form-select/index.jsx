/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

const FormSelect = React.createClass({
    getDefaultProps() {
        return {
            isError: false,
        };
    },

    render() {
        const { className, isError, ...props } = this.props,
            classes = classNames(className, 'form-select', {
                'is-error': isError,
            });

        return (
            <select {...props} className={classes}>
                {this.props.children}
            </select>
        );
    },
});

export default FormSelect;
