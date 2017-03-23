/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PostEditButton from 'blocks/post-edit-button';

export default React.createClass({
    displayName: 'PostEditButton',

    mixins: [PureRenderMixin],

    render() {
        const post = { ID: 123, type: 'post' };
        const site = { slug: 'example.com' };
        return (
            <div className="design-assets__group">
                <h2>
                    <a href="/devdocs/design/edit-button">Post Edit Button</a>
                </h2>
                <PostEditButton post={post} site={site} />
            </div>
        );
    },
});
