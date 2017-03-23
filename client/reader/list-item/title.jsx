/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import noop from 'lodash/noop';

const ListItemTitle = React.createClass({
    mixins: [PureRenderMixin],

    getDefaultProps() {
        return { onClick: noop };
    },

    render() {
        return (
            <h2 className="reader-list-item__title" onClick={this.props.onClick}>
                {this.props.children}
            </h2>
        );
    },
});

export default ListItemTitle;
