import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ScreenReaderText, Spinner } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { Button, Modal } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSiteDomain, getSiteOption } from 'calypso/state/sites/selectors';
import { activate as activateTheme } from 'calypso/state/themes/actions';
import { getCanonicalTheme, isRequestingTheme } from 'calypso/state/themes/selectors';
import IframePreviewCard from './iframe-preview-card';
import type { IAppState } from 'calypso/state/types';
import type { Theme } from 'calypso/types';

import './activation-modal.scss';

type SetupChoice = 'basic_setup' | 'full_setup';

const RADIO_GROUP_NAME = 'activation-modal-setup-choice';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface StyleVariation {
	slug?: string;
	title?: string;
}

interface OwnProps {
	themeId: string;
	siteId: number;
	source?: 'details' | 'list' | 'upload';
	styleVariation?: StyleVariation;
	onClose: () => void;
}

interface ConnectedProps {
	theme: Theme | null;
	siteDomain?: string | null;
	isLoadingTheme: boolean;
	isSiteLaunched: boolean;
	siteAgeInDays: number | null;
}

interface DispatchProps {
	dispatchActivateTheme: typeof activateTheme;
}

type Props = OwnProps & ConnectedProps & DispatchProps;

const ActivationModal = ( {
	theme,
	siteId,
	siteDomain,
	isLoadingTheme,
	isSiteLaunched,
	siteAgeInDays,
	source = 'details',
	styleVariation,
	onClose,
	dispatchActivateTheme,
}: Props ) => {
	const translate = useTranslate();
	const locale = useLocale();
	const [ choice, setChoice ] = useState< SetupChoice >( 'full_setup' );
	const [ isActivating, setIsActivating ] = useState( false );

	// Fire the modal-view Tracks event once per modal mount, after the theme
	// is loaded so we have the theme id to attach.
	const hasFiredViewEvent = useRef( false );
	useEffect( () => {
		if ( hasFiredViewEvent.current || ! theme ) {
			return;
		}
		hasFiredViewEvent.current = true;
		recordTracksEvent( 'calypso_theme_activation_modal_view', {
			theme: theme.id,
			source,
			is_site_launched: isSiteLaunched,
			...( siteAgeInDays !== null && { site_age_in_days: siteAgeInDays } ),
		} );
	}, [ theme, source ] );

	if ( ! theme || ! siteDomain ) {
		return null;
	}

	const { id: themeId, name: themeName, stylesheet, demo_uri: demoUri } = theme;

	// Match the convention used by client/my-sites/themes/theme-preview.jsx:
	// pass the variation's `title` (not slug) as the `style_variation` query
	// arg, and skip it for the default variation.
	const styleVariationParam =
		styleVariation && styleVariation.slug && styleVariation.slug !== 'default'
			? { style_variation: styleVariation.title }
			: {};

	// Match theme-preview.jsx: append `&language=<locale>` so the previewed
	// site renders in the user's UI locale. Skip for `en` (the default) and
	// for empty values.
	const localeParam = locale && locale !== 'en' ? { language: locale } : {};

	// "Basic setup": preview the user's existing site with the new theme's
	// stylesheet applied — no theme-headstart, no content additions.
	const basicSetupIframeSrc = addQueryArgs( `//${ siteDomain }/`, {
		theme: stylesheet,
		hide_banners: 'true',
		...styleVariationParam,
		...localeParam,
	} );

	// "Full setup": preview the theme's official demo site, which is what the
	// theme-headstart endpoint will broadly replicate by adding pages to the site.
	const fullSetupIframeSrc = demoUri
		? addQueryArgs( demoUri, {
				demo: 'true',
				iframe: 'true',
				theme_preview: 'true',
				...styleVariationParam,
				...localeParam,
		  } )
		: null;

	// `demo_uri` can land a tick after the canonical theme is first cached, so
	// show a spinner until it arrives. Without this, the basic-setup card would
	// briefly stretch alone before the full-setup card pops in.
	const isWaitingForFullSetup = ! fullSetupIframeSrc && isLoadingTheme;

	const handleActivate = async () => {
		const setupChoice = choice === 'full_setup' ? 'full' : 'basic';
		recordTracksEvent( 'calypso_theme_activation_modal_activate_click', {
			theme: themeId,
			source,
			setup_choice: setupChoice,
			is_site_launched: isSiteLaunched,
			...( siteAgeInDays !== null && { site_age_in_days: siteAgeInDays } ),
		} );
		setIsActivating( true );
		try {
			await dispatchActivateTheme( themeId, siteId, { source, setupChoice } );
		} finally {
			onClose();
		}
	};

	const handleDismiss = () => {
		if ( isActivating ) {
			return;
		}
		recordTracksEvent( 'calypso_theme_activation_modal_dismiss', {
			theme: themeId,
			source,
			is_site_launched: isSiteLaunched,
			...( siteAgeInDays !== null && { site_age_in_days: siteAgeInDays } ),
		} );
		onClose();
	};

	const basicSetupOptionName = translate( 'Basic setup' ) as string;
	const fullSetupOptionName = translate( 'Full setup' ) as string;
	const basicSetupLabel = translate(
		"Basic setup: Use the theme's styling, but don't add extra pages to the site"
	) as string;
	const fullSetupLabel = translate(
		'Full setup: Add extra content to more closely match the design'
	) as string;

	return (
		<Modal
			className={ clsx( 'themes__activation-modal', { 'is-activating': isActivating } ) }
			title={
				translate( 'How would you like to use %(themeName)s?', {
					args: { themeName },
				} ) as string
			}
			onRequestClose={ handleDismiss }
			shouldCloseOnClickOutside={ ! isActivating }
			shouldCloseOnEsc={ ! isActivating }
		>
			<div
				className="themes__activation-modal-previews"
				role="radiogroup"
				aria-label={ translate( 'Setup option' ) as string }
			>
				{ isWaitingForFullSetup ? (
					<div className="themes__activation-modal-loading" role="status">
						<Spinner size={ 50 } />
						<ScreenReaderText>{ translate( 'Loading preview…' ) }</ScreenReaderText>
					</div>
				) : (
					<>
						<IframePreviewCard
							name={ RADIO_GROUP_NAME }
							value="basic_setup"
							isSelected={ choice === 'basic_setup' }
							onSelect={ ( value ) => setChoice( value as SetupChoice ) }
							label={ basicSetupLabel }
							optionName={ basicSetupOptionName }
							iframeUrl={ basicSetupIframeSrc }
							iframeTitle={
								translate( "Preview of your site with %(themeName)s's basic setup applied", {
									args: { themeName },
								} ) as string
							}
							caption={ basicSetupLabel }
							disabled={ isActivating }
						/>
						<IframePreviewCard
							name={ RADIO_GROUP_NAME }
							value="full_setup"
							isSelected={ choice === 'full_setup' }
							onSelect={ ( value ) => setChoice( value as SetupChoice ) }
							label={ fullSetupLabel }
							optionName={ fullSetupOptionName }
							iframeUrl={ fullSetupIframeSrc as string }
							iframeTitle={
								translate( "Preview of your site with %(themeName)s's full setup applied", {
									args: { themeName },
								} ) as string
							}
							caption={ fullSetupLabel }
							disabled={ isActivating }
						/>
					</>
				) }
			</div>
			{ /*
				Persistent live region so screen readers hear when activation
				starts. Success and error outcomes are announced separately via
				Calypso's notice system after the modal closes.
			*/ }
			<div className="screen-reader-text" role="status">
				{ isActivating &&
					( translate( 'Activating %(themeName)s…', { args: { themeName } } ) as string ) }
			</div>
			<div className="themes__activation-modal-actions">
				<Button variant="tertiary" onClick={ handleDismiss } disabled={ isActivating }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleActivate }
					isBusy={ isActivating }
					disabled={ isActivating }
				>
					{ translate( 'Activate %(themeName)s', { args: { themeName } } ) }
				</Button>
			</div>
		</Modal>
	);
};

export default connect(
	( state: IAppState, { themeId, siteId }: OwnProps ): ConnectedProps => {
		const createdAt = getSiteOption( state, siteId, 'created_at' ) as string | undefined;
		const siteAgeInDays = createdAt
			? Math.floor( ( Date.now() - new Date( createdAt ).getTime() ) / DAY_IN_MS )
			: null;
		return {
			theme: getCanonicalTheme( state, siteId, themeId ),
			siteDomain: getSiteDomain( state, siteId ),
			isLoadingTheme: isRequestingTheme( state, 'wpcom', themeId ),
			isSiteLaunched: ! isUnlaunchedSite( state, siteId ),
			siteAgeInDays,
		};
	},
	{
		dispatchActivateTheme: activateTheme,
	}
)( ActivationModal );
