import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { ReactNode } from 'react';

import './style.scss';

export default function SnackbarBackButton( {
	backUrl,
	children,
}: {
	backUrl: string;
	children: ReactNode;
} ) {
	const navigate = useNavigate();

	return (
		<div
			className="dashboard-snackbar-back-button"
			style={ {
				position: 'fixed',
				bottom: '16px',
				insetInlineStart: '16px',
				zIndex: 3,
			} }
		>
			<Button
				variant="primary"
				icon={ isRTL() ? chevronRight : chevronLeft }
				iconPosition="left"
				onClick={ () => {
					navigate( { to: backUrl } );
				} }
			>
				{ children }
			</Button>
		</div>
	);
}
