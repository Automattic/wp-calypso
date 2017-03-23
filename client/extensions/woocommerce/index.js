/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

const render = context => {
    renderWithReduxStore(
        <Main className="woocommerce__main">
            <SectionHeader label="WooCommerce Store" />
            <Card>
                <p>This is the start of something great!</p>
                <p>
                    This will be the home for your WooCommerce Store integration with WordPress.com.
                </p>
            </Card>
        </Main>,
        document.getElementById('primary'),
        context.store
    );
};

export default function() {
    page('/store/:site?', siteSelection, navigation, render);
}
