import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

type Props = {
	showMainButtonLabel: boolean;
	mainButtonLabelText?: string;
	isMenuVisible: boolean;
	toggleMenu: () => void;
	popoverMenuContext: React.RefObject< HTMLButtonElement >;
};

const AddNewSiteButton: React.FC< Props > = ( {
	showMainButtonLabel,
	mainButtonLabelText,
	isMenuVisible,
	toggleMenu,
	popoverMenuContext,
} ) => {
	const translate = useTranslate();
	const mainButtonLabel = mainButtonLabelText || translate( 'Add sites' );

	return (
		<Button
			variant="secondary"
			ref={ popoverMenuContext }
			className="add-new-site__button"
			onClick={ toggleMenu }
		>
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
		</Button>
	);
};

export default AddNewSiteButton;
