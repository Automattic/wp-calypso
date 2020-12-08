/**
 * External dependencies
 */
import page from 'page';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPathToSelector } from './utils';
import { WithRedirectToSelectorProps } from './types';

const withRedirectToSelector = < T extends object >(
	Component: React.ComponentType< T >
): React.FC< T & WithRedirectToSelectorProps > => ( props: WithRedirectToSelectorProps ) => {
	const { duration, rootUrl, urlQueryArgs } = props;
	const siteSlug = useSelector( getSelectedSiteSlug );
	const previousSiteSlug = useRef< string | null >( null );

	useEffect( () => {
		if ( siteSlug && ! previousSiteSlug.current ) {
			previousSiteSlug.current = siteSlug;
			return;
		}

		if ( siteSlug && previousSiteSlug.current && siteSlug !== previousSiteSlug.current ) {
			page.redirect( getPathToSelector( rootUrl, urlQueryArgs, duration, siteSlug ) );
			return;
		}
	}, [ siteSlug ] );

	return <Component { ...( props as T ) } />;
};

export default withRedirectToSelector;
