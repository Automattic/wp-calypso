/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

const ListItemPlaceholder = React.createClass({
    render() {
        return (
            <CompactCard className="domain-management-list-item is-placeholder">
                <div className="domain-management-list-item__link">
                    <div className="domain-management-list-item__title" />
                    <div className="domain-management-list-item__meta">
                        <span className="domain-management-list-item__type" />
                    </div>
                </div>
            </CompactCard>
        );
    },
});

export default ListItemPlaceholder;
