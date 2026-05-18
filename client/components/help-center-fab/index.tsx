import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect } from 'react';
import useShowHelpCenter from 'calypso/components/help-center/use-show-help-center';
import { useCurrentRoute } from 'calypso/components/route';
import HelpCenterLoader from 'calypso/layout/help-center-loader';

import './style.scss';

const QuestionMarkIcon = () => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
	>
		<path
			fill="currentColor"
			d="M11.07 12.85c.77-1.39 2.25-2.21 3.11-3.44.91-1.29.4-3.7-2.18-3.7-1.69 0-2.52 1.28-2.87 2.34L6.54 6.96C7.25 4.83 9.18 3 11.99 3c2.35 0 3.96 1.07 4.78 2.41.7 1.15 1.11 3.3.03 4.9-1.2 1.77-2.35 2.31-2.97 3.45-.25.46-.35.76-.35 2.24h-2.89c-.01-.78-.13-2.05.48-3.15zM14 20c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"
		/>
	</svg>
);

export type HelpCenterFabProps = {
	sectionName: string;
};

const HelpCenterFab = ( { sectionName }: HelpCenterFabProps ) => {
	const { __ } = useI18n();
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useShowHelpCenter();
	const { currentRoute } = useCurrentRoute();

	// The Help Center panel's "above the FAB" positioning keys off this body
	// class — see `body.has-help-center-fab` in `./style.scss`.
	useEffect( () => {
		document.body.classList.add( 'has-help-center-fab' );
		return () => document.body.classList.remove( 'has-help-center-fab' );
	}, [] );

	const handleClick = () => {
		const willShow = ! isHelpCenterShown;
		recordTracksEvent( `calypso_inlinehelp_${ willShow ? 'show' : 'close' }`, {
			location: 'help-center-fab',
			section: sectionName,
		} );
		setShowHelpCenter( willShow );
	};

	const label = isHelpCenterShown
		? /* translators: Tooltip on the floating Help button when the Help Center panel is open. */
		  __( 'Close help' )
		: /* translators: Tooltip on the floating Help button that opens the Help Center. */
		  __( 'Help' );

	return (
		<>
			{
				// Mount lazily so we don't expose an empty role="dialog" container at idle.
				isHelpCenterShown && (
					<HelpCenterLoader
						sectionName={ sectionName }
						loadHelpCenter
						currentRoute={ currentRoute }
					/>
				)
			}
			<Button
				className={ clsx( 'help-center-fab', { 'is-active': isHelpCenterShown } ) }
				onClick={ handleClick }
				label={ label }
				showTooltip
				aria-haspopup="dialog"
				aria-expanded={ isHelpCenterShown }
			>
				<QuestionMarkIcon />
			</Button>
		</>
	);
};

export default HelpCenterFab;
