import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	errorMessage?: string | null;
};

export default function DashboardModalFormFooter( { children, errorMessage }: Props ) {
	return (
		<div className="dashboard-modal-form__footer">
			{ errorMessage && (
				<div className="dashboard-modal-form__footer-error" role="alert">
					{ errorMessage }
				</div>
			) }
			<div className="dashboard-modal-form__footer-buttons">{ children }</div>
		</div>
	);
}
