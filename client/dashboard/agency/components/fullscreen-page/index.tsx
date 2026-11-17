import { AutomatticLogo } from '@automattic/components/src/logos/automattic-logo';
import { useLocation } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import RouterLinkButton from '../../../components/router-link-button';
import './style.scss';

/**
 * The search for a link to a full-screen page, so its Back link returns to the current page.
 */
export function useBackHereSearch() {
	const location = useLocation();
	return { from: location.pathname + location.searchStr };
}

/**
 * A page that takes the whole screen (an `isFullscreen` route), with the logo and a Back link
 * in place of the sidebar.
 */
export default function FullscreenPage( {
	backTo,
	children,
}: {
	backTo: string;
	children: React.ReactNode;
} ) {
	return (
		<div className="agency-fullscreen-page">
			<HStack
				className="agency-fullscreen-page__top-bar"
				justify="flex-start"
				spacing={ 6 }
				expanded={ false }
			>
				<AutomatticLogo width={ 183 } height={ 40 } />
				<RouterLinkButton
					to={ backTo }
					variant="link"
					icon={ isRTL() ? chevronRight : chevronLeft }
				>
					{ __( 'Back' ) }
				</RouterLinkButton>
			</HStack>
			{ children }
		</div>
	);
}
