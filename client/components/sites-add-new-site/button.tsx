import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
	showMainButtonLabel: boolean;
	mainButtonLabelText?: string;
	isMenuVisible: boolean;
	toggleMenu: () => void;
}

const AddNewSiteButton: React.FC< Props > = ( {
	showMainButtonLabel,
	mainButtonLabelText,
	isMenuVisible,
	toggleMenu,
	children,
} ) => {
	const translate = useTranslate();
	const mainButtonLabel = mainButtonLabelText || translate( 'Add sites' );

	return (
		<Button variant="primary" className="sites-add-new-site__button" onClick={ toggleMenu }>
			<>
				{ showMainButtonLabel ? mainButtonLabel : null }
				<Gridicon
					className={ clsx(
						{ reverse: showMainButtonLabel && isMenuVisible },
						{ mobile: ! showMainButtonLabel }
					) }
					icon={ showMainButtonLabel ? 'chevron-down' : 'plus' }
				/>
			</>
			{ children }
		</Button>
	);
};

export default AddNewSiteButton;
