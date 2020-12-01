/**
 * External dependencies
 */
import * as React from 'react';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';

interface Props {
	title: string;
	description?: string;
}

export const PatternPopover: React.FunctionComponent< Props > = ( { title, description } ) => {
	// @TODO: Pass in pattern description instead of hard-coded text below.
	return (
		<div className="pattern-popover">
			<div className="pattern-popover__content">
				<h2 className="pattern-popover__title">{ title }</h2>
				{ description && <p>{ description }</p> }
			</div>
			<Notice className="pattern-popover__notice" status="info" isDismissible={ false }>
				{ __( 'Requires upgrade to a paid plan.', 'full-site-editing' ) }
			</Notice>
		</div>
	);
};

export default PatternPopover;
