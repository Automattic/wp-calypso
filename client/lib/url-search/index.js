/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { doSearch, getSearchOpen } from 'lib/mixins/url-search';

export default function(Component) {
    const componentName = Component.displayName || Component.name || '';

    return class extends React.Component {
        state = {
            searchOpen: false,
        };

        displayName = 'Searchable' + componentName;

        constructor(props) {
            super(props);

            this.doSearch = doSearch.bind(this);
            this.getSearchOpen = getSearchOpen.bind(this);
        }

        componentWillReceiveProps = ({ search }) => !search && this.setState({ searchOpen: false });

        render() {
            return (
                <Component
                    {...{
                        ...this.props,
                        doSearch: this.doSearch,
                        getSearchOpen: this.getSearch,
                    }}
                />
            );
        }
    };
}
