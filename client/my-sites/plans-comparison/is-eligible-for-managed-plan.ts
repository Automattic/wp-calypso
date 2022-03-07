import { isEnabled } from '@automattic/calypso-config';
import { css } from '@emotion/react';
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

export const globalOverrides = css`
	#content.layout__content {
		overflow: unset;
		min-height: 100vh !important;
		background: #fdfdfd;
		padding-left: 0;
		padding-right: 0;
		padding-top: 47px;
	}

	.layout__secondary {
		box-shadow: 0 1px 0 1px rgba( 0, 0, 0, 0.1 );
	}

	.is-nav-unification .sidebar .sidebar__heading::after,
	.is-nav-unification .sidebar .sidebar__menu-link::after {
		html[dir='ltr'] & {
			margin-right: -1px;
			border-right-color: #fdfdfd;
		}
		html[dir='rtl'] & {
			margin-left: -1px;
			border-left-color: #fdfdfd;
		}
	}

	.main.is-wide-layout.is-wide-layout {
		max-width: 100%;
	}

	.formatted-header__title.formatted-header__title {
		font-size: 1rem;
		font-family: inherit !important;
		font-weight: 600;
		margin: 0 auto;
		max-width: 1040px;
	}

	.formatted-header__subtitle {
		display: none;
	}

	.formatted-header.formatted-header {
		border-bottom: 1px solid #dcdcde;
		padding-bottom: 24px;
		margin: 0;

		html[dir='ltr'] & {
			padding: 12px 24px 24px calc( var( --sidebar-width-min ) + 24px + 1px );
		}
		html[dir='rtl'] & {
			padding: 12px calc( var( --sidebar-width-min ) + 24px + 1px ) 24px 24px;
		}

		@media ( max-width: 782px ) {
			padding: 24px 16px;
		}
	}

	.plans,
	.current-plan__content {
		max-width: 1040px;
		margin: auto;

		html[dir='ltr'] & {
			padding: 0 24px 0 calc( var( --sidebar-width-min ) + 24px + 1px );
		}
		html[dir='rtl'] & {
			padding: 0 calc( var( --sidebar-width-min ) + 24px + 1px ) 0 24px;
		}

		@media ( max-width: 782px ) {
			html[dir='ltr'] &,
			html[dir='rtl'] & {
				padding: 0;
			}
		}
	}

	.section-nav.section-nav {
		box-shadow: none;
		background: none;
		margin: 16px 0 32px;
	}

	.section-nav-tab {
		opacity: 0.7;
	}

	.section-nav-tab.is-selected,
	.section-nav-tab:hover {
		opacity: 1;
	}

	.section-nav-tab__link {
		font-size: 16px;
	}

	.section-nav-tab__link,
	.section-nav-tab__link:hover,
	.section-nav-tab__link:focus,
	.section-nav-tab__link:active {
		color: inherit !important;
		background: none !important;
	}

	.section-nav-tab:hover:not( .is-selected ) {
		border-bottom-color: transparent;
	}

	.my-plan-card__icon {
		display: none;
	}

	.my-plan-card__title {
		font-family: Recoleta;
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.notice.notice {
		color: inherit;
	}

	.notice.is-info {
		background: #f6f7f7;
	}

	.notice__content.notice__content {
		html[dir='ltr'] & {
			padding: 10px 10px 10px 0;
		}
		html[dir='rtl'] & {
			padding: 10px 0 10px 10px;
		}
	}

	.notice.is-info .notice__icon-wrapper.notice__icon-wrapper {
		background: none;
		width: 40px;
	}

	.notice .gridicons-info-outline {
		fill: #008a20;
	}

	.my-plan-card.card {
		flex-direction: column;
		justify-content: stretch;
	}

	.my-plan-card__primary {
		min-width: 60%;
	}

	.my-plan-card__details {
		display: none;
	}

	.popover__arrow {
		display: none;
	}
	.popover.info-popover__tooltip .popover__inner {
		background: var( --studio-gray-100 );
		color: #fff;
		border: none;
		padding: 8px 10px;
		border-radius: 4px;
		font-size: 0.75rem;
	}
`;
