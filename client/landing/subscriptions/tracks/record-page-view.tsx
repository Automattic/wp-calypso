import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageView } from 'calypso/lib/analytics/page-view';

const useRoutePath = () => {
	const { pathname } = useLocation();

	// We are doing manual path matching because we want to
	// track matched route path, not the full url, e.g.
	// GOOD: /subscriptions/site/:blogId
	// BAD: /subscriptions/sites/123456
	//
	// The existing functions from react-router couldn't
	// provide use with a useful matched route path.

	if ( pathname.indexOf( '/subscriptions/settings' ) === 0 ) {
		return '/subscriptions/settings';
	}

	if ( pathname.indexOf( '/subscriptions/pending' ) === 0 ) {
		return '/subscriptions/pending';
	}

	if ( pathname.indexOf( '/subscriptions/comments' ) === 0 ) {
		return '/subscriptions/comments';
	}

	if ( pathname.indexOf( '/subscriptions/sites' ) === 0 ) {
		return '/subscriptions/sites';
	}

	if ( pathname.indexOf( '/subscriptions/site/invalid' ) === 0 ) {
		return '/subscriptions/site/invalid';
	}

	if ( pathname.indexOf( '/subscriptions/site' ) === 0 ) {
		return '/subscriptions/site/:blogId';
	}

	if ( pathname.indexOf( '/subscriptions' ) === 0 ) {
		return '/subscriptions/sites';
	}

	return pathname;
};

export default () => {
	const routePath = useRoutePath();

	useEffect( () => {
		recordPageView( routePath, document.title );
	}, [ routePath ] );

	return <></>;
};
