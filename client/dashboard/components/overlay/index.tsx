import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import { createPortal } from 'react-dom';

import './style.scss';

function Overlay( {
	children,
	backLabel,
	fallbackCloseRoute,
}: {
	children: React.ReactNode;
	backLabel: string;
	fallbackCloseRoute: string;
} ) {
	const canGoBack = useCanGoBack();
	const router = useRouter();

	return createPortal(
		<div className="dashboard-overlay">
			<div className="dashboard-overlay__actions">
				<Button
					icon={ chevronLeft }
					onClick={ () => {
						if ( canGoBack ) {
							router.history.back();
						} else {
							router.navigate( {
								to: fallbackCloseRoute,
								replace: true,
							} );
						}
					} }
				>
					{ backLabel }
				</Button>
			</div>
			<div className="dashboard-overlay__content">{ children }</div>
		</div>,
		document.body
	);
}

export default Overlay;
