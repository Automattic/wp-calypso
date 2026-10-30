/**
 * The widget's skeleton, drawn while its chunk downloads: an Overview card with two totals
 * and a chart, a lists card, on Jetpack sites a card with two counts, and the footer. Plain
 * markup and inline styles, since this runs from the loader before any of the widget's code
 * or CSS has arrived. React replaces it when the widget mounts.
 *
 * Its own container, so the totals stack at the width the widget stacks them, from the first
 * paint. The widget's stylesheet zeroes the margin once it arrives (index.scss).
 */

const STYLE = `
.jp-stats-widget-skeleton{container-type:inline-size;margin:-11px -12px -12px;padding:8px;display:flex;flex-direction:column;gap:8px;border-radius:0 0 8px 8px;background:#f6f7f7;font-size:0}
.jp-stats-widget-skeleton__card{border-radius:4px;box-shadow:0 0 0 1px rgba(0,0,0,.1);background:#fff}
.jp-stats-widget-skeleton__header{display:flex;justify-content:space-between;align-items:center;min-height:32px;padding:8px}
.jp-stats-widget-skeleton__body{padding:8px 12px 12px}
.jp-stats-widget-skeleton__body.is-tabbed{padding-top:0}
.jp-stats-widget-skeleton__metrics{display:flex;gap:16px}
.jp-stats-widget-skeleton__metric{display:flex;flex-direction:column;flex:1 1 0}
.jp-stats-widget-skeleton__tabs{display:flex;margin:0 -12px;border-bottom:1px solid #dbdbdb}
.jp-stats-widget-skeleton__tab{flex:1;display:flex;justify-content:center;padding:18px 0}
.jp-stats-widget-skeleton__rows{display:flex;flex-direction:column;margin-top:8px}
.jp-stats-widget-skeleton__row{display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:32px}
.jp-stats-widget-skeleton__link{display:flex;align-items:center;height:18.2px;margin-top:16px}
.jp-stats-widget-skeleton__link.is-view-all{margin-top:8px}
.jp-stats-widget-skeleton__footer{display:flex;justify-content:space-between;align-items:center;padding:8px}
.jp-stats-widget-skeleton__bar{display:block;height:12px;border-radius:4px;background:#f4f4f4}
.jp-stats-widget-skeleton__bar.is-title{width:140px;height:16px}
.jp-stats-widget-skeleton__bar.is-control{width:112px;height:32px}
.jp-stats-widget-skeleton__bar.is-label{width:72px;height:14px;margin:3px 0}
.jp-stats-widget-skeleton__bar.is-value{width:64px;height:28px;margin:8px 0 4px}
.jp-stats-widget-skeleton__bar.is-chart{height:160px;border-radius:8px;margin-top:16px}
.jp-stats-widget-skeleton__bar.is-tab{width:96px}
.jp-stats-widget-skeleton__bar.is-row-title{width:60%}
.jp-stats-widget-skeleton__bar.is-row-value{width:46px}
.jp-stats-widget-skeleton__bar.is-link{width:72px}
.jp-stats-widget-skeleton__bar.is-logo{width:88px;height:20px}
.jp-stats-widget-skeleton__bar.is-footer-link{width:80px}
@container (max-width:360px){.jp-stats-widget-skeleton__metrics{flex-direction:column}.jp-stats-widget-skeleton__metric{flex:none}}
@media not (prefers-reduced-motion){.jp-stats-widget-skeleton__bar{animation:jp-stats-widget-skeleton-pulse 1.5s ease-in-out infinite}}
@media (forced-colors:active){.jp-stats-widget-skeleton__bar{border:1px solid CanvasText}}
@keyframes jp-stats-widget-skeleton-pulse{0%,100%{opacity:1}50%{opacity:.4}}
`;

const bar = ( modifier: string ) =>
	`<span class="jp-stats-widget-skeleton__bar is-${ modifier }"></span>`;

const metric = () =>
	`<div class="jp-stats-widget-skeleton__metric">${ bar( 'label' ) }${ bar( 'value' ) }</div>`;

const metrics = () =>
	`<div class="jp-stats-widget-skeleton__metrics">${ metric() }${ metric() }</div>`;

const row = () =>
	`<div class="jp-stats-widget-skeleton__row">${ bar( 'row-title' ) }${ bar( 'row-value' ) }</div>`;

const tab = () => `<div class="jp-stats-widget-skeleton__tab">${ bar( 'tab' ) }</div>`;

const tabs = () => `<div class="jp-stats-widget-skeleton__tabs">${ tab() }${ tab() }</div>`;

// A line of link text, sized to the line box the widget's link takes.
const link = ( isViewAll = false ) =>
	`<div class="jp-stats-widget-skeleton__link${ isViewAll ? ' is-view-all' : '' }">${ bar(
		'link'
	) }</div>`;

const header = ( withControl: boolean ) =>
	`<div class="jp-stats-widget-skeleton__header">${ bar( 'title' ) }${
		withControl ? bar( 'control' ) : ''
	}</div>`;

const body = ( content: string, isTabbed = false ) =>
	`<div class="jp-stats-widget-skeleton__body${ isTabbed ? ' is-tabbed' : '' }">${ content }</div>`;

const card = ( content: string ) =>
	`<div class="jp-stats-widget-skeleton__card">${ content }</div>`;

const FOOTER = `<div class="jp-stats-widget-skeleton__footer">${ bar( 'logo' ) }${ bar( 'footer-link' ) }</div>`;

interface SkeletonOptions {
	/** Whether the widget will show the Site protection card, which only Jetpack sites get. */
	hasSiteProtection: boolean;
}

// Each card is laid out as the widget's section is (a 48px header, then a padded body), so the
// box is the height the widget takes when it mounts: see the sizes in the widget's own
// stylesheets. One list row, as the widget draws while its lists load: how many items come
// back is unknown.
const markup = ( { hasSiteProtection }: SkeletonOptions ) =>
	card( header( true ) + body( metrics() + bar( 'chart' ) + link() ) ) +
	card(
		header( false ) +
			body(
				tabs() + `<div class="jp-stats-widget-skeleton__rows">${ row() }</div>` + link( true ),
				true
			)
	) +
	( hasSiteProtection ? card( header( false ) + body( metrics() ) ) : '' ) +
	FOOTER;

/**
 * Replaces the container's server-rendered spinner with the widget's skeleton.
 * @param container The element the widget mounts in.
 * @param options   Which parts of the widget this site gets.
 */
export default function renderLoadingSkeleton(
	container: HTMLElement | null,
	options: SkeletonOptions
) {
	// A stats-admin release that renders the skeleton itself leaves nothing to replace.
	if ( ! container || container.querySelector( '.jp-stats-widget-skeleton' ) ) {
		return;
	}

	// The spinner's alt text is the one translated "Loading" on the page this early.
	const label = container.querySelector( 'img' )?.alt || 'Loading';

	const skeleton = document.createElement( 'div' );
	skeleton.className = 'jp-stats-widget-skeleton';
	skeleton.setAttribute( 'role', 'status' );
	skeleton.setAttribute( 'aria-label', label );
	skeleton.innerHTML = `<style>${ STYLE }</style>${ markup( options ) }`;

	container.replaceChildren( skeleton );
}
