import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type { A4ASelectSiteButtonProps } from './types';

export default function A4ASelectSiteButton( {
	buttonLabel,
	className,
	handleOpenModal,
}: A4ASelectSiteButtonProps ) {
	const translate = useTranslate();

	return (
		<Button
			__next40pxDefaultSize
			variant="secondary"
			onClick={ handleOpenModal }
			className={ clsx( className ) }
		>
			{ buttonLabel || translate( 'Select a site' ) }
		</Button>
	);
}
