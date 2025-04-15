import { lazy } from 'react';

export const LazyLeaveSiteModal = lazy(
	() => import( /* webpackChunkName: "leave-site-modal" */ './leave-site-modal' )
);
