import { Button } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import page from 'page';
import React from 'react';

type BackButtonProps = {
	backUrl: string;
};

export default function CollectionBackButton( { backUrl }: BackButtonProps ) {
	return (
		<Button
			className="theme-collection-view-header__back"
			icon={ chevronLeft }
			onClick={ () => page( backUrl ) }
			variant="link"
		>
			{ translate( 'Back' ) }
		</Button>
	);
}
