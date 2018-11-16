/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { registerExample } from '@wordpress/muriel-doc-examples';

registerExample( 
    'button/disabled',
    {
        render: function () {
            return (
                <Button isDefault disabled>Hello, Muriel!</Button> 
            );
        }
    }
);

