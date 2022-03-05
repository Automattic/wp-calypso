import { isEnabled } from '@automattic/calypso-config';
import { isE2ETest } from 'calypso/lib/e2e';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

export function isEligibleForManagedPlan( state: AppState, siteId?: number ): boolean {
	if ( isE2ETest() ) {
		return false;
	}

	if ( siteId && ( isJetpackSite( state, siteId ) || isSiteWPForTeams( state, siteId ) ) ) {
		return false;
	}

	return isEnabled( 'plans/managed-plan' );
}

export const globalOverrides = {
	'#content.layout__content': {
		overflow: 'unset',
		'min-height': '100vh !important',
		background: '#fff',
		'padding-left': 0,
		'padding-right': 0,
		'padding-top': '58px',
	},
	'.layout__secondary': {
		'box-shadow': '0 1px 0 1px rgba(0,0,0,0.1)',
	},
	'.is-nav-unification .sidebar .sidebar__heading::after, .is-nav-unification .sidebar .sidebar__menu-link::after': {
		'margin-right': '-1px',
	},
	'.main.is-wide-layout': {
		'max-width': '100%',
	},
	'.formatted-header__title.wp-brand-font': {
		'font-size': '1rem',
		'font-family': 'inherit !important',
		'font-weight': '600',
		'margin-left': 'auto',
		'margin-right': 'auto',
	},
	'.formatted-header__subtitle': {
		display: 'none',
	},
	'.formatted-header': {
		'border-bottom': '1px solid #DCDCDE',
		'padding-bottom': '24px',
		padding: '0 24px 24px calc(var(--sidebar-width-min) + 24px + 1px)',
		'@media (max-width: 782px)': {
			padding: '0 0 24px 16px',
		},
	},
	'.plans, .formatted-header__title, .current-plan__content': {
		'max-width': '1040px',
		margin: 'auto',
		padding: '0 24px 0 calc(var(--sidebar-width-min) + 24px + 1px)',
		'@media (max-width: 782px)': {
			padding: '0',
		},
	},
	'.section-nav': {
		'box-shadow': 'none',
		background: 'none',
	},
	'.section-nav-tab': {
		opacity: 0.7,
	},
	'.section-nav-tab.is-selected, .section-nav-tab:hover': {
		opacity: 1,
	},
	'.section-nav-tab__link, .section-nav-tab__link:hover, .section-nav-tab__link:focus, .section-nav-tab__link:active': {
		color: 'inherit !important',
		background: 'none !important',
		'font-size': '16px',
	},
	'.my-plan-card__icon': {
		display: 'none',
	},
	'.my-plan-card__title': {
		'font-family': 'Recoleta',
		'font-size': '1.5rem',
		'margin-bottom': '0.5rem',
	},
};
