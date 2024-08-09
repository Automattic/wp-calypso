import clsx from 'clsx';
import { ReactNode } from 'react';

interface ImporterActionButtonContainerProps {
	justifyContentCenter?: boolean;
	children: ReactNode;
	className?: string;
}

const ImporterActionButtonContainer = ( {
	justifyContentCenter = false,
	children,
	className,
}: ImporterActionButtonContainerProps ) =>
	children ? (
		<div
			className={ clsx( 'importer-action-buttons__container', className, {
				'is-justify-content-center': justifyContentCenter,
			} ) }
		>
			{ children }
		</div>
	) : null;

ImporterActionButtonContainer.displayName = 'ImporterActionButtonContainer';

export default ImporterActionButtonContainer;
