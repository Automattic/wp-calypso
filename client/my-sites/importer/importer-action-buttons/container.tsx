import clsx from 'clsx';
import { ReactNode } from 'react';

interface ImporterActionButtonContainerProps {
	justifyContentCenter?: boolean;
	children: ReactNode;
	noSpacing?: boolean;
}

const ImporterActionButtonContainer = ( {
	justifyContentCenter = false,
	children,
	noSpacing,
}: ImporterActionButtonContainerProps ) =>
	children ? (
		<div
			className={ clsx( 'importer-action-buttons__container', {
				'is-justify-content-center': justifyContentCenter,
				'no-spacing': noSpacing,
			} ) }
		>
			{ children }
		</div>
	) : null;

ImporterActionButtonContainer.displayName = 'ImporterActionButtonContainer';

export default ImporterActionButtonContainer;
