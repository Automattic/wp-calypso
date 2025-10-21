import { FC, ReactNode } from 'react';

interface SshMigrationContainerProps {
	children: ReactNode;
	progress?: ReactNode;
}

export const SshMigrationContainer: FC< SshMigrationContainerProps > = ( {
	children,
	progress,
} ) => {
	return (
		<div>
			{ progress && <div>{ progress }</div> }
			<div>{ children }</div>
		</div>
	);
};
