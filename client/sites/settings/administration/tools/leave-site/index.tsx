import { lazy } from 'react';

export const LazyLeaveSiteModal = lazy(
	() => import( /* webpackChunkName: "leave-site-modal" */ './leave-site-modal' )
);

export const LazyLeaveSiteModalForm = lazy(
	() => import( /* webpackChunkName: "leave-site-modal-form" */ './leave-site-modal-form' )
);
