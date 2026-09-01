import { HelpCenter } from '@automattic/data-stores';
import { HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT } from '@automattic/data-stores/src/help-center/constants';
import { useLocale } from '@automattic/i18n-utils';
import { useBreakpoint } from '@automattic/viewport-react';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useExperiment } from 'calypso/lib/explat';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { onboardingUrl } from 'calypso/lib/paths';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import { useHelpCenterSite } from './use-help-center-site';

const importHelpCenter = () =>
	import( /* webpackChunkName: "async-load-automattic-help-center" */ '@automattic/help-center' );

const HELP_CENTER_STORE = HelpCenter.register();

type Props = {
	sectionName: string;
	loadHelpCenter: boolean;
	currentRoute: string;
};

export default function HelpCenterLoader( { sectionName, loadHelpCenter, currentRoute }: Props ) {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const isDesktop = useBreakpoint( '>782px' );
	const handleClose = useCallback( () => {
		setShowHelpCenter( false, undefined, true );
	}, [ setShowHelpCenter ] );

	const locale = useLocale();
	const hasPurchases = useSelector( hasCancelableUserPurchases );
	const user = useSelector( getCurrentUser );
	const agency = useSelector( getActiveAgency );
	const { site } = useHelpCenterSite();
	const [ , getHelpChatForwardAssignment ] = useExperiment(
		HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT
	);

	if ( ! loadHelpCenter ) {
		return null;
	}

	const additionalHelpCenterProps = isA8CForAgencies()
		? {
				newInteractionsBotSlug: 'automattic-chat-support_a4a',
				agency: agency
					? {
							id: agency.id,
							pressableId: agency?.third_party?.pressable?.pressable_id,
					  }
					: null,
				product: 'a4a' as const,
		  }
		: {};

	return (
		<AsyncLoad
			require={ importHelpCenter }
			placeholder={ null }
			handleClose={ handleClose }
			currentRoute={ currentRoute }
			locale={ locale }
			sectionName={ sectionName }
			site={ site }
			currentUser={ user }
			hasPurchases={ hasPurchases }
			// hide Calypso's version of the help-center on Desktop, because the Editor has its own help-center
			hidden={ sectionName === 'gutenberg-editor' && isDesktop }
			onboardingUrl={ onboardingUrl() }
			googleMailServiceFamily={ getGoogleMailServiceFamily() }
			experimentVariations={ {
				[ HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT ]:
					getHelpChatForwardAssignment?.variationName ?? null,
			} }
			{ ...additionalHelpCenterProps }
		/>
	);
}
