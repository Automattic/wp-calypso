import { useLocale } from '@automattic/i18n-utils';
import { SENSEI_FLOW, setThemeOnSite } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useNewSiteVisibility } from 'calypso/landing/stepper/hooks/use-selected-plan';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import { Progress } from '../components/sensei-step-progress';
import { wait } from '../sensei-launch/launch-completion-tasks';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';
import type { StyleVariation } from 'calypso/../packages/design-picker';

const getStyleVariations = ( siteId: number, stylesheet: string ): Promise< StyleVariation[] > =>
	wpcom.req.get( {
		path: `/sites/${ siteId }/global-styles/themes/${ stylesheet }/variations`,
		apiNamespace: 'wp/v2',
	} );

type Theme = {
	_links: {
		'wp:user-global-styles': { href: string }[];
	};
};
const getSiteTheme = ( siteId: number, stylesheet: string ): Promise< Theme > =>
	wpcom.req.get( {
		path: `/sites/${ siteId }/themes/${ stylesheet }`,
		apiNamespace: 'wp/v2',
	} );

const updateGlobalStyles = (
	siteId: number,
	globalStylesId: number,
	styleVariation: StyleVariation
) =>
	wpcom.req.post( {
		path: `/sites/${ siteId }/global-styles/${ globalStylesId }`,
		apiNamespace: 'wp/v2',
		body: styleVariation,
	} );

const installCourseTheme = ( siteId: number ) =>
	wpcom.req.post( {
		path: `/sites/${ siteId }/themes/course/install`,
	} );

const COURSE_THEME = 'course';

export const useCreateSenseiSite = () => {
	const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
	const { setIntentOnSite, saveSiteSettings } = useDispatch( SITE_STORE );
	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);
	const { createSenseiSite, setSelectedSite } = useDispatch( ONBOARD_STORE );
	const { getSelectedStyleVariation } = useSelect(
		( select ) => select( ONBOARD_STORE ) as OnboardSelect,
		[]
	);

	const { __ } = useI18n();
	const locale = useLocale();
	const visibility = useNewSiteVisibility();

	const siteProgressTitle = __( 'Laying out the foundations' );
	const cartProgressTitle = __( 'Preparing Your Bundle' );
	const styleProgressTitle = __( 'Applying your site styles' );

	const [ progress, setProgress ] = useState< Progress >( {
		percentage: 0,
		title: siteProgressTitle,
	} );

	const setCourseThemeAndVariation = async ( siteId: number ) => {
		if ( siteId ) {
			await installCourseTheme( siteId );
			await setThemeOnSite( siteId.toString(), 'pub/' + COURSE_THEME );
			const selectedStyleVariationTitle = getSelectedStyleVariation() ?? '';
			const [ styleVariations, theme ]: [ StyleVariation[], Theme ] = await Promise.all( [
				getStyleVariations( siteId, COURSE_THEME ),
				getSiteTheme( siteId, COURSE_THEME ),
			] );
			const userGlobalStylesLink: string =
				theme?._links?.[ 'wp:user-global-styles' ]?.[ 0 ]?.href || '';
			const userGlobalStylesId = parseInt( userGlobalStylesLink.split( '/' ).pop() || '', 10 );
			const styleVariation = styleVariations.find(
				( variation ) => variation.title === selectedStyleVariationTitle
			);

			if ( styleVariation && userGlobalStylesId ) {
				await updateGlobalStyles( siteId, userGlobalStylesId, styleVariation );
			}
		}
	};

	const createAndConfigureSite = useCallback( async () => {
		setProgress( {
			percentage: 25,
			title: siteProgressTitle,
		} );

		await createSenseiSite( {
			username: currentUser?.username || '',
			languageSlug: locale,
			visibility,
		} );

		setProgress( {
			percentage: 50,
			title: cartProgressTitle,
		} );

		const newSite = getNewSite();
		const siteId = newSite?.blogid;
		setSelectedSite( newSite?.blogid );
		await Promise.all( [
			setIntentOnSite( newSite?.site_slug as string, SENSEI_FLOW ),
			saveSiteSettings( newSite?.blogid as number, { launchpad_screen: 'off' } ),
		] );

		setProgress( {
			percentage: 75,
			title: styleProgressTitle,
		} );

		if ( siteId ) {
			await setThemeOnSite( siteId.toString(), COURSE_THEME );
			wait( 1200 );
			const selectedStyleVariationTitle = getSelectedStyleVariation()?.title;
			const [ styleVariations, theme ]: [ StyleVariation[], Theme ] = await Promise.all( [
				getStyleVariations( siteId, COURSE_THEME ),
				getSiteTheme( siteId, COURSE_THEME ),
			] );
			const userGlobalStylesLink: string =
				theme?._links?.[ 'wp:user-global-styles' ]?.[ 0 ]?.href || '';
			const userGlobalStylesId = parseInt( userGlobalStylesLink.split( '/' ).pop() || '', 10 );
			const styleVariation = styleVariations.find(
				( variation ) => variation.title === selectedStyleVariationTitle
			);
			if ( styleVariation && userGlobalStylesId ) {
				await updateGlobalStyles( siteId, userGlobalStylesId, styleVariation );
			}
		}

		setProgress( {
			percentage: 100,
			title: styleProgressTitle,
		} );

		return { site: newSite };
	}, [
		createSenseiSite,
		currentUser?.username,
		getNewSite,
		getSelectedStyleVariation,
		locale,
		saveSiteSettings,
		setIntentOnSite,
		setSelectedSite,
		visibility,
		siteProgressTitle,
		cartProgressTitle,
		styleProgressTitle,
	] );

	return { createAndConfigureSite, progress, setCourseThemeAndVariation };
};
