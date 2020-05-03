/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { toggleCartOnMobile } from 'state/ui/checkout/actions';
import { isShowingCartOnMobile } from 'state/ui/checkout/selectors';

function CartToggle( props ) {
	const translate = useTranslate();

	const label = props.isShowingCartOnMobile
		? translate( 'Hide order summary' )
		: translate( 'Show order summary' );

	return (
		<Button className="is-link checkout__summary-toggle" onClick={ props.toggleCartOnMobile }>
			{ label }
		</Button>
	);
}

export default connect(
	( state ) => ( {
		isShowingCartOnMobile: isShowingCartOnMobile( state ),
	} ),
	{ toggleCartOnMobile }
)( CartToggle );
