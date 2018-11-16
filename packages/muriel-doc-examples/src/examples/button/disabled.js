/**
 * WordPress dependencies
 */
import { registerExample } from '@wordpress/muriel-doc-examples';

registerExample( 
    'button/disabled',
    {
        render: () => {
            return import('@wordpress/components').then( ( { Button } ) => {
                return <Button disabled />;
            } );
        }
    }
);

