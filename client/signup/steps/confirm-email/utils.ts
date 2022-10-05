import { getStepUrl } from 'calypso/signup/utils';
import type { I18N } from 'i18n-calypso';

type StepProps = {
	flowName: string;
	stepName: string;
	selectedSite?: {
		URL: string;
	};
	locale?: string;
	queryObject?: {
		siteSlug?: string;
		source?: string;
	};
	path?: string;
	translate: I18N[ 'translate' ];
};

export function getPrevLocation( {
	flowName,
	stepName,
	selectedSite,
	queryObject,
	translate,
	path = '',
	locale = '',
}: StepProps ) {
	const siteUrl = selectedSite?.URL;
	const { source, siteSlug } = queryObject || {};

	if ( 'site' === source && siteUrl ) {
		return {
			url: siteUrl,
			label: translate( 'Back to My Site' ),
			isExternal: true,
		};
	}

	if ( 'my-home' === source && siteSlug ) {
		return {
			url: `/home/${ siteSlug }`,
			label: translate( 'Back to My Home' ),
			isExternal: true,
		};
	}

	if ( 'general-settings' === source && siteSlug ) {
		return {
			url: `/settings/general/${ siteSlug }`,
			label: translate( 'Back to General Settings' ),
			isExternal: true,
		};
	}

	const backUrl = getStepUrl( flowName, stepName, null, locale );
	const pathWithoutQuery = path.replace( /\?.+$/, '' );

	if ( backUrl === pathWithoutQuery ) {
		return {
			url: '/sites',
			label: translate( 'Back to My Site' ),
			isExternal: true,
		};
	}

	return {
		url: backUrl,
		label: translate( 'Back' ),
		isExternal: false,
	};
}
