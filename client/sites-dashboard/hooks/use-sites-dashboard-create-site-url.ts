import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/url';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
import { TRACK_SOURCE_NAME } from '../utils';

export const useSitesDashboardCreateSiteUrl = () => {
	const { 'hosting-flow': hostingFlow } = useSelector( getCurrentQueryArguments ) ?? {};

	const newSiteURL =
		isEnabled( 'hosting-onboarding-i2' ) && hostingFlow === 'true'
			? '/setup/new-hosted-site'
			: '/start';

	return addQueryArgs( { source: TRACK_SOURCE_NAME, ref: 'calypso-nosites' }, newSiteURL );
};
