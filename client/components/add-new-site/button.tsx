import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

type Props = {
	showMainButtonLabel: boolean;
	isMenuVisible: boolean;
	toggleMenu: () => void;
	popoverMenuContext: React.RefObject< HTMLButtonElement >;
};

const AddNewSiteButton: React.FC< Props > = ( {
	showMainButtonLabel,
	isMenuVisible,
	toggleMenu,
	popoverMenuContext,
} ) => {
	const translate = useTranslate();

	return (
		<Button
			variant="secondary"
			ref={ popoverMenuContext }
			className="add-new-site__button"
			onClick={ toggleMenu }
		>
			<>
				{ showMainButtonLabel ? translate( 'Add sites' ) : null }
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
