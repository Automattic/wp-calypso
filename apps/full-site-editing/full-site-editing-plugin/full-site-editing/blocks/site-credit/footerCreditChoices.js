/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable wpcalypso/import-docblock */
/* global fullSiteEditing */
/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';

const CreditTextRenderer = ( { label } ) => <span>{ label }</span>;
const CreditIconRenderer = props => <Icon { ...props } />;

export const creditOptions = fullSiteEditing.footerCreditOptions;

export const RenderedCreditChoice = ( { choice } ) => {
	const selection = creditOptions.find( ( { value } ) => value === choice );
	if ( selection ) {
		const { renderType, renderProps, label } = selection;
		const renderer = renderType === 'icon' ? CreditIconRenderer : CreditTextRenderer;
		return renderer( { label, ...renderProps } );
	}
	return null;
};
