import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { siteDeploymentsListRoute, siteRoute } from '../../app/router/sites';

export function BackToDeploymentsButton() {
	const { siteSlug } = siteRoute.useParams();
	const navigate = useNavigate();

	return (
		<div
			className="back-to-deployments-button"
			style={ {
				position: 'fixed',
				bottom: '16px',
				insetInlineStart: '16px',
			} }
		>
			<Button
				variant="secondary"
				icon={ isRTL() ? chevronRight : chevronLeft }
				iconPosition="left"
				onClick={ () => {
					navigate( {
						to: siteDeploymentsListRoute.fullPath,
						params: { siteSlug },
					} );
				} }
				style={ {
					backgroundColor: '#1e1e1e',
					color: '#ffffff',
					borderColor: '#1e1e1e',
					boxShadow: 'none',
				} }
			>
				{ __( 'Back to Deployments' ) }
			</Button>
		</div>
	);
}
