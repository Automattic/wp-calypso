/**
 * BLOCK: Button Block
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';

const name = 'premium-content/button';
const category = 'common';

/**
 * @typedef {object} Attributes
 * @property { string } newPlanName
 * @property { string } newPlanCurrency
 * @property { number } newPlanPrice
 * @property { string } newPlanInterval
 * @property { number } selectedPlanId
 *
 * @typedef {import('@wordpress/blocks').BlockConfiguration<Attributes>} BlockConfiguration
 * @type {BlockConfiguration}
 */
const settings = {
    name,
    attributes: {
        blockID: {
            type: 'string',
            default: '',
        },
        buttonText: {
            type: 'string',
            default: 'Log In',
        },
        align: {
            type: 'string',
            default: 'center',
        },
        buttonType: {
            type: 'string',
            default: 'login',
        },
        buttonClasses: {
            type: 'string',
            default: '',
        },
        backgroundButtonColor: {
            type: 'string',
            default: '',
        },
        textButtonColor: {
            type: 'string',
            default: '',
        },
        customBackgroundButtonColor: {
            type: 'string',
            default: '',
        },
        customTextButtonColor: {
            type: 'string',
            default: '',
        },
        'premium-content/container/selectedPlanId': {
            type: 'number',
            default: 0,
        },
    },

    /**
     * An icon property should be specified to make it easier to identify a block.
     * These can be any of WordPress’ Dashicons, or a custom svg element.
     */
    icon: (
        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12.7439 14.4271L8.64053 13.165L8.51431 13.8718L8.09208 20.7415C8.06165 21.2365 8.61087 21.5526 9.02363 21.2776L12.7439 18.799L16.7475 21.304C17.1687 21.5676 17.7094 21.2343 17.6631 20.7396L17.0212 13.8718L17.0212 13.165L12.7439 14.4271Z"
                fill="black"
            />
            <circle cx="12.7439" cy="8.69796" r="5.94466" stroke="black" strokeWidth="1.5" fill="none" />
            <path
                d="M9.71023 8.12461L11.9543 10.3687L15.7776 6.54533"
                stroke="black"
                strokeWidth="1.5"
                fill="none"
            />
        </svg>
    ),

    /* translators: block name */
    title: __( 'Premium Content Button', 'premium-content' ),
    /* translators: block description */
    description: __( 'Premium Content Button.', 'premium-content' ),
    parent: [ 'premium-content/logged-out-view' ],
    supports: {
        html: false,
    },
    edit,
    save: () => null,
    context: [ 'premium-content/container/selectedPlanId' ],
};

export { name, category, settings };
