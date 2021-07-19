/* global fullSiteEditing */

// eslint-disable-next-line no-restricted-imports
import { Icon } from '@wordpress/components';

const { footerCreditOptions } = fullSiteEditing;

export const RenderedCreditChoice = ( { choice } ) => {
	const selection = footerCreditOptions.find( ( { value } ) => value === choice );
	if ( ! selection ) {
		return null;
	}

	const { renderType, renderProps, label } = selection;
	// Allows label to be overriden by renderProps if needed.
	const props = { label, ...renderProps };
	if ( 'icon' === renderType ) {
		return <Icon { ...props } />;
	}
	return <span> { props.label } </span>;
};
