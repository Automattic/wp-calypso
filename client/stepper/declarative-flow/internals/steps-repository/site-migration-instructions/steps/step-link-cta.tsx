import { recordMigrationInstructionsLinkClick } from '../tracking';
import { StepButton } from './step-button';
import type { FC, ReactNode } from 'react';

interface Props {
	url: string;
	linkname: string;
	children: ReactNode;
}

export const StepLinkCta: FC< Props > = ( { url, linkname, children } ) => {
	const openNewPage = () => {
		window.open( url, '_blank' );
		recordMigrationInstructionsLinkClick( linkname );
	};

	return (
		<StepButton variant="primary" onClick={ openNewPage }>
			{ children }
		</StepButton>
	);
};
