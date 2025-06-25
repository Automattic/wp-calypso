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
	isPrimary?: boolean;
}
const DoneButton: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const {
		job,
		siteId,
		label = __( 'Pick a design' ),
		resetImport,
		onSiteViewClick,
		className,
		isPrimary = true,
	} = props;

	function onButtonClick() {
		onSiteViewClick?.();
		job && siteId && resetImport && resetImport( siteId, job?.importerId );
	}

	return (
		<NextButton
			variant={ isPrimary ? 'primary' : 'secondary' }
			className={ className }
			onClick={ onButtonClick }
		>
			{ label }
		</NextButton>
	);
};

export default DoneButton;
