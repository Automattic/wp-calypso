/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';

const CreditTextRenderer = ( { label } ) => <span>{ label }</span>;

// @TODO: Figure out i18n.
// @TODO: Figure out how to extend this so they can be overridden for WordPress.com
export const creditOptions = [
	{ label: 'Proudly powered by WordPress', value: 'default', onRender: CreditTextRenderer },
	{ label: 'WordPress Icon', value: 'svg', onRender: () => <Icon icon="wordpress" /> },
];

export const RenderedCreditChoice = ( { choice } ) => {
	const selection = creditOptions.find( ( { value } ) => value === choice );
	if ( selection && selection.onRender ) {
		const { onRender } = selection;
		return onRender( selection );
	}
	return null;
};
