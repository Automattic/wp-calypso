import { isEnabled } from '@automattic/calypso-config';
import { NextButton } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { ImportJob } from '../../types';

interface Props {
	job?: ImportJob;
	siteId?: number;
	label?: string;
	resetImport?: ( siteId: number, importerId: string ) => void;
	onSiteViewClick?: () => void;
	className?: string;
	variant?: 'primary' | 'secondary';
}
const DoneButton: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const {
		job,
		siteId,
		label = isEnabled( 'onboarding/import-redirect-to-themes' )
			? __( 'Pick a design' )
			: __( 'View site' ),
		resetImport,
		onSiteViewClick,
		className,
		variant = 'primary',
	} = props;

	function onButtonClick() {
		onSiteViewClick?.();
		job && siteId && resetImport && resetImport( siteId, job?.importerId );
	}

	return (
		<NextButton variant={ variant } className={ className } onClick={ onButtonClick }>
			{ label }
		</NextButton>
	);
};

export default DoneButton;
